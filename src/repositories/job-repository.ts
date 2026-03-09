import { query } from "../database/connection";
import { Job } from "../models/job-model";
import { JobStatuses } from "../enums/job-enums";

export const create = async (job: Job): Promise<Job> => {
  const result = await query(
    "INSERT INTO jobs (job_handler, job_category, status, data) VALUES ($1, $2, $3, $4) RETURNING id, job_handler as jobHandler, job_category as jobCategory, status, data, created_at as createdAt, updated_at as updatedAt",
    [job.handler, job.category, job.status, JSON.stringify(job.data ?? {})],
  );

  const row = result.rows[0];

  if (!row?.id) {
    throw new Error("Failed to create job");
  }

  return row;
};

export const findById = async (id: number): Promise<Job | null> => {
  const result = await query(
    "SELECT id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt FROM jobs WHERE id = $1",
    [id],
  );
  return result.rows.length ? result.rows[0] : null;
};

export const update = async (id: number, data: any): Promise<Job | null> => {
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

  return result.rows.length ? result.rows[0] : null;
};

export const updateHistory = async (
  id: number,
  status: JobStatuses,
  error?: string,
): Promise<Job | null> => {
  await query(
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
  return null;
};
