import { query } from "../database/connection";
import type { NewJob } from "../interfaces/Job";
import { Job } from "../models/Job";
import * as JobEnums from "../enums/Job";

const JobRepository = {
  async create(job: Job): Promise<NewJob> {
    const result = await query(
      "INSERT INTO jobs (job_handler, job_category, status, data) VALUES ($1, $2, $3, $4) RETURNING id, job_handler as jobHandler, job_category as jobCategory, status, data, created_at as createdAt, updated_at as updatedAt",
      [job.handler, job.category, job.status, JSON.stringify(job.data ?? {})],
    );

    const row = result.rows[0];

    if (!row?.id) {
      throw new Error("Failed to create job");
    }

    return row;
  },

  async findById(id: number): Promise<Job | null> {
    const result = await query(
      "SELECT id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt FROM jobs WHERE id = $1",
      [id],
    );
    return result.rows.length ? result.rows[0] : null;
  },

  async update(id: number, data: any): Promise<Job | null> {
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

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt`,
      values,
    );

    return result.rows.length ? result.rows[0] : null;
  },
};

export default JobRepository;

// export const findAll = async (): Promise<Job[]> => {
//   const result = await query(
//     "SELECT id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt FROM jobs ORDER BY created_at DESC",
//   );
//   return result.rows.map(mapRowToJob);
// };

// export const findUpdatedSince = async (since: Date): Promise<Job[]> => {
//   const result = await query(
//     "SELECT id, job_handler as jobHandler, job_category as jobCategory, status, data, history, created_at as createdAt, updated_at as updatedAt FROM jobs WHERE updated_at > $1 ORDER BY updated_at DESC",
//     [since.toISOString()],
//   );
//   return result.rows.map(mapRowToJob);
// };

// export const delete_ = async (id: number): Promise<boolean> => {
//   const result = await query("DELETE FROM jobs WHERE id = $1", [id]);
//   return result.rowCount! > 0;
// };

export const addHistory = async (
  id: number,
  status: JobEnums.Statuses,
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
