import { query } from "../database/connection";
import { Job } from "../models/job-model";
import { JobStatuses } from "../enums/job-enums";
import {
  DashboardJob,
  DashboardJobQueryOptions,
  JobSortBy,
  JobHistoryEntry,
  PaginatedDashboardJobs,
  UpdateJobPayload,
} from "../types/job-types";

const buildHistoryEntry = (status: string, error?: string): JobHistoryEntry => ({
  status,
  timestamp: new Date().toISOString(),
  error,
});

const normalizeUpdatePayload = (
  input: UpdateJobPayload | JobStatuses | unknown,
): UpdateJobPayload => {
  if (typeof input === "string") {
    return { status: input };
  }

  if (input instanceof Error) {
    return {
      status: JobStatuses.ERROR,
      data: { error: input.message },
    };
  }

  if (
    input &&
    typeof input === "object" &&
    (Object.prototype.hasOwnProperty.call(input, "status") ||
      Object.prototype.hasOwnProperty.call(input, "data"))
  ) {
    return input as UpdateJobPayload;
  }

  return {
    status: JobStatuses.ERROR,
    data: { error: String(input) },
  };
};

const SELECT_DASHBOARD_JOB_FIELDS =
  'SELECT id, job_handler as "jobHandler", job_category as "jobCategory", status, data, history, created_at as "createdAt", updated_at as "updatedAt" FROM jobs';

const SORT_BY_COLUMN: Record<JobSortBy, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  status: "status",
  jobHandler: "job_handler",
  jobCategory: "job_category",
};

const buildWhereClause = (
  options: DashboardJobQueryOptions,
  since?: Date,
): { where: string[]; params: (string | number)[] } => {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (since) {
    params.push(since.toISOString());
    where.push(`updated_at > $${params.length}`);
  }

  if (options.handler) {
    params.push(options.handler);
    where.push(`job_handler = $${params.length}`);
  }

  if (options.status) {
    params.push(options.status);
    where.push(`status = $${params.length}`);
  }

  if (options.category) {
    params.push(options.category);
    where.push(`job_category = $${params.length}`);
  }

  if (options.search) {
    params.push(`%${options.search}%`);
    where.push(
      `(id::text ILIKE $${params.length} OR job_handler ILIKE $${params.length} OR job_category ILIKE $${params.length} OR status ILIKE $${params.length} OR data::text ILIKE $${params.length})`,
    );
  }

  return { where, params };
};

const buildDashboardQuery = (
  options: DashboardJobQueryOptions,
  since?: Date,
): { sql: string; params: (string | number)[] } => {
  const { where, params } = buildWhereClause(options, since);

  const sortBy = options.sortBy ?? (since ? "updatedAt" : "createdAt");
  const sortOrder = (options.sortOrder ?? "desc").toUpperCase();
  let sql = `${SELECT_DASHBOARD_JOB_FIELDS}`;

  if (where.length > 0) {
    sql += ` WHERE ${where.join(" AND ")}`;
  }

  sql += ` ORDER BY ${SORT_BY_COLUMN[sortBy]} ${sortOrder}`;

  if (options.limit !== undefined) {
    params.push(options.limit);
    sql += ` LIMIT $${params.length}`;
  }

  if (options.offset !== undefined) {
    params.push(options.offset);
    sql += ` OFFSET $${params.length}`;
  }

  return { sql, params };
};

const countMatchingJobs = async (
  options: DashboardJobQueryOptions,
  since?: Date,
): Promise<number> => {
  const { where, params } = buildWhereClause(options, since);
  let sql = "SELECT COUNT(*)::int as total FROM jobs";
  if (where.length > 0) {
    sql += ` WHERE ${where.join(" AND ")}`;
  }

  const result = await query(sql, params);
  return Number(result.rows[0]?.total ?? 0);
};

export const create = async (job: Job): Promise<Job> => {
  const initialHistory = JSON.stringify([buildHistoryEntry(job.status)]);
  const result = await query(
    `
  INSERT INTO jobs (id, job_handler, job_category, status, data, history)
  VALUES ($1, $2, $3, $4, $5, $6::jsonb)
  RETURNING
    id,
    job_handler as "jobHandler",
    job_category as "jobCategory",
    status,
    data,
    history,
    created_at as "createdAt",
    updated_at as "updatedAt"
  `,
    [job.id, job.handler, job.category, job.status, job.stringData, initialHistory],
  );

  const row = result.rows[0];

  if (!row?.id) {
    throw new Error("Failed to create job");
  }

  return row;
};

export const findById = async (id: string): Promise<Job | null> => {
  const result = await query(
    'SELECT id, job_handler as "jobHandler", job_category as "jobCategory", status, data, history, created_at as "createdAt", updated_at as "updatedAt" FROM jobs WHERE id = $1',
    [id],
  );
  return result.rows.length ? result.rows[0] : null;
};

export const findDashboardJobById = async (id: string): Promise<DashboardJob | null> => {
  const result = await query(
    'SELECT id, job_handler as "jobHandler", job_category as "jobCategory", status, data, history, created_at as "createdAt", updated_at as "updatedAt" FROM jobs WHERE id = $1',
    [id],
  );
  return result.rows.length ? (result.rows[0] as DashboardJob) : null;
};

export const findAll = async (options: DashboardJobQueryOptions = {}): Promise<DashboardJob[]> => {
  const { sql, params } = buildDashboardQuery(options);
  const result = await query(sql, params);
  return result.rows as DashboardJob[];
};

export const findUpdatedSince = async (
  since: Date,
  options: DashboardJobQueryOptions = {},
): Promise<DashboardJob[]> => {
  const { sql, params } = buildDashboardQuery(options, since);
  const result = await query(sql, params);
  return result.rows as DashboardJob[];
};

export const findAllPaginated = async (
  options: DashboardJobQueryOptions,
  page: number,
  limit: number,
): Promise<PaginatedDashboardJobs> => {
  const queryOptions: DashboardJobQueryOptions = {
    ...options,
    limit,
    offset: (page - 1) * limit,
  };

  const [items, total] = await Promise.all([findAll(queryOptions), countMatchingJobs(options)]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

export const findUpdatedSincePaginated = async (
  since: Date,
  options: DashboardJobQueryOptions,
  page: number,
  limit: number,
): Promise<PaginatedDashboardJobs> => {
  const queryOptions: DashboardJobQueryOptions = {
    ...options,
    limit,
    offset: (page - 1) * limit,
  };

  const [items, total] = await Promise.all([
    findUpdatedSince(since, queryOptions),
    countMatchingJobs(options, since),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

export const update = async (
  id: string,
  data: UpdateJobPayload | JobStatuses | unknown,
): Promise<Job | null> => {
  const updatePayload = normalizeUpdatePayload(data);
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (updatePayload.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updatePayload.status);

    const errorMessage =
      typeof updatePayload.data?.error === "string" ? updatePayload.data.error : undefined;
    fields.push(`history = history || $${paramIndex++}::jsonb`);
    values.push(JSON.stringify([buildHistoryEntry(updatePayload.status, errorMessage)]));
  }
  if (updatePayload.data !== undefined) {
    fields.push(`data = $${paramIndex++}`);
    values.push(JSON.stringify(updatePayload.data));
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING id, job_handler as "jobHandler", job_category as "jobCategory", status, data, history, created_at as "createdAt", updated_at as "updatedAt"`,
    values,
  );

  return result.rows.length ? result.rows[0] : null;
};

export const updateHistory = async (
  id: string,
  status: JobStatuses,
  error?: string,
): Promise<Job | null> => {
  const result = await query(
    `UPDATE jobs SET
      history = history || $1::jsonb,
      status = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, job_handler as "jobHandler", job_category as "jobCategory", status, data, history, created_at as "createdAt", updated_at as "updatedAt"`,
    [JSON.stringify([buildHistoryEntry(status, error)]), status, id],
  );
  return result.rows.length ? result.rows[0] : null;
};
