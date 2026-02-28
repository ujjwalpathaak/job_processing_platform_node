import { Pool, QueryResult } from "pg";
import { config } from "../config";

const pool = new Pool({
  connectionString: config.database.url,
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
});

export const query = async (
  text: string,
  params?: (string | number | null)[],
  log: boolean = false,
): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (log) console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Database query error", { text, error });
    throw error;
  }
};

export const getClient = async () => {
  return pool.connect();
};

export const closePool = async () => {
  await pool.end();
};

export default pool;
