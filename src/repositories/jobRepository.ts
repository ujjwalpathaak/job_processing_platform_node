import { query } from "../database/connection";
import { Job, CreateJobRequest, UpdateJobRequest } from "../models/Job";
import { JobStatus, JobCategory, JobHandlerType } from "../enums";
import { JobHistory } from "../models/Job";

export const findAll = async (): Promise<Job[]> => {
  const result = await query(
    "SELECT id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt FROM jobs ORDER BY created_at DESC",
  );
  return result.rows.map(mapRowToJob);
};

export const findById = async (id: number): Promise<Job | null> => {
  const result = await query(
    "SELECT id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt FROM jobs WHERE id = $1",
    [id],
  );
  return result.rows.length ? mapRowToJob(result.rows[0]) : null;
};

export const findUpdatedSince = async (since: Date): Promise<Job[]> => {
  const result = await query(
    "SELECT id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt FROM jobs WHERE updated_at > $1 ORDER BY updated_at DESC",
    [since.toISOString()],
  );
  return result.rows.map(mapRowToJob);
};

export const create = async (data: CreateJobRequest): Promise<Job> => {
  const { jobHandler, jobCategory, data: jobData } = data;
  const result = await query(
    "INSERT INTO jobs (job_handler, job_category, status, data, history) VALUES ($1, $2, $3, $4, $5) RETURNING id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt",
    [jobHandler, jobCategory, 0, JSON.stringify(jobData || {}), JSON.stringify([])],
  );
  return mapRowToJob(result.rows[0]);
};

export const update = async (id: number, data: UpdateJobRequest): Promise<Job | null> => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.data !== undefined) {
    fields.push(`data = $${paramIndex++}`);
    values.push(JSON.stringify(data.data));
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt`,
    values,
  );

  return result.rows.length ? mapRowToJob(result.rows[0]) : null;
};

export const delete_ = async (id: number): Promise<boolean> => {
  const result = await query("DELETE FROM jobs WHERE id = $1", [id]);
  return result.rowCount! > 0;
};

export const addHistory = async (
  id: number,
  status: number,
  error?: string,
): Promise<Job | null> => {
  const result = await query(
    `UPDATE jobs SET 
      history = history || $1::jsonb,
      status = $2,
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = $3 
    RETURNING id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt`,
    [
      JSON.stringify([
        {
          status,
          timestamp: new Date().toISOString(),
          error,
        },
      ]),
      status,
      id,
    ],
  );
  return result.rows.length ? mapRowToJob(result.rows[0]) : null;
};

const mapRowToJob = (row: Record<string, unknown>): Job => ({
  id: row.id as number,
  jobHandler: row.jobHandler as JobHandlerType,
  jobCategory: row.jobCategory as JobCategory,
  status: row.status as JobStatus,
  data: (row.data as Record<string, unknown>) || {},
  history: Array.isArray(row.history) ? (row.history as JobHistory[]) : [],
  createdAt: new Date(row.createdAt as string),
  updatedAt: new Date(row.updatedAt as string),
});
