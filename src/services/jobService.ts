import { query } from "../database/connection";
import { Job, CreateJobRequest, UpdateJobRequest } from "../models/Job";

export const getAllJobs = async (): Promise<Job[]> => {
  const result = await query("SELECT * FROM jobs ORDER BY created_at DESC");
  return result.rows as Job[];
};

export const getJobById = async (id: number): Promise<Job | null> => {
  const result = await query("SELECT * FROM jobs WHERE id = $1", [id]);
  return (result.rows[0] as Job) || null;
};

export const createJob = async (data: CreateJobRequest): Promise<Job> => {
  const { name, description } = data;
  const result = await query(
    "INSERT INTO jobs (name, description) VALUES ($1, $2) RETURNING *",
    [name, description],
  );
  return result.rows[0] as Job;
};

export const updateJob = async (
  id: number,
  data: UpdateJobRequest,
): Promise<Job | null> => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }

  if (fields.length === 0) return getJobById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  return (result.rows[0] as Job) || null;
};

export const deleteJob = async (id: number): Promise<boolean> => {
  const result = await query("DELETE FROM jobs WHERE id = $1", [id]);
  return result.rowCount! > 0;
};
