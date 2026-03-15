import { query } from "./connection";

export const initializeDatabase = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY,
        job_handler VARCHAR(100) NOT NULL,
        job_category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'SCHEDULED',
        data JSONB,
        history JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON jobs(created_at DESC);
    `);

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization error", error);
    throw error;
  }
};
