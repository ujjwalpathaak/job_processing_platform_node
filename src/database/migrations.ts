import { query } from "./connection";
import { Logger } from "../services/log-service";

export const initializeDatabase = async () => {
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS vector;`);

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
      CREATE INDEX IF NOT EXISTS jobs_created_at_idx 
      ON jobs(created_at DESC);
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS job_chunks (
        id BIGSERIAL PRIMARY KEY,
        job_id TEXT,
        handler TEXT,
        content TEXT NOT NULL,
        embedding VECTOR(782) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_handler ON job_chunks(handler);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_created_at ON job_chunks(created_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_embedding ON job_chunks
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);

    Logger.info("Database schema migrations initialized successfully");
  } catch (error) {
    Logger.error(`Database schema migration initialization failed | error=${error}`);
    throw error;
  }
};
