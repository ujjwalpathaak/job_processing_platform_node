import { Pool, QueryResult } from "pg";
import { config } from "../config/config";
import { Logger } from "../services/log-service";

const pool = new Pool({
  connectionString: config.database.url,
});

pool.on("error", (err: Error) => {
  Logger.error(`Database pool emitted idle client error | error=${err}`);
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
    if (log) {
      Logger.info(
        `Database query executed | durationMs=${duration} | rows=${result.rowCount ?? 0} | sql=${text}`,
      );
    }
    return result;
  } catch (error) {
    Logger.error(`Database query failed | sql=${text} | error=${error}`);
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
