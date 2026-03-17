import { query } from "../database/connection";
import { RAGFilters, RetrievedChunk } from "../dto/rag-dtos";

const vectorParam = (embedding: number[]): string => `[${embedding.join(",")}]`;

export const insertJobChunk = async (
  jobId: string,
  handler: string,
  logLevel: string,
  logSource: string,
  logStream: string,
  content: string,
  embedding: number[],
): Promise<void> => {
  await query(
    `
      INSERT INTO job_chunks (job_id, handler, log_level, log_source, log_stream, content, embedding)
      VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
    `,
    [jobId, handler, logLevel, logSource, logStream, content, vectorParam(embedding)],
  );
};

export const searchChunksHybrid = async (
  embedding: number[],
  filters: RAGFilters,
  limit: number,
): Promise<RetrievedChunk[]> => {
  const whereClause: string[] = [];
  const params: (string | number)[] = [vectorParam(embedding)];

  if (filters.handler) {
    params.push(filters.handler);
    whereClause.push(`handler = $${params.length}`);
  }

  if (filters.log_level) {
    params.push(filters.log_level.toUpperCase());
    whereClause.push(`log_level = $${params.length}`);
  }

  if (filters.log_source) {
    params.push(filters.log_source.toUpperCase());
    whereClause.push(`log_source = $${params.length}`);
  }

  if (filters.log_stream) {
    params.push(filters.log_stream.toUpperCase());
    whereClause.push(`log_stream = $${params.length}`);
  }

  params.push(limit);

  const whereSql = whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

  const result = await query(
    `
      SELECT
        id,
        job_id,
        handler,
        log_level,
        log_source,
        log_stream,
        content,
        created_at,
        1 - (embedding <=> $1::vector) as similarity
      FROM job_chunks
      ${whereSql}
      ORDER BY embedding <=> $1::vector
      LIMIT $${params.length}
    `,
    params,
  );

  return result.rows as RetrievedChunk[];
};
