import { RAGFilters, RetrievedChunk } from "../dto/rag-dtos";
import { getPgVectorStore } from "../services/langchain-pgvector-service";
import { query } from "../database/connection";

const toFilter = (filters: RAGFilters): Record<string, string> => {
  const normalized: Record<string, string> = {};

  if (filters.handler) {
    normalized.handler = filters.handler;
  }

  if (filters.job_id) {
    normalized.job_id = filters.job_id;
  }

  return normalized;
};

const toRetrievedChunk = (
  document: { id?: string; pageContent: string; metadata: Record<string, unknown> },
  similarity: number,
): RetrievedChunk => {
  const metadata = document.metadata ?? {};

  return {
    id: Number(document.id || metadata.id || 0),
    job_id: String(metadata.job_id || ""),
    handler: String(metadata.handler || "unknown"),
    content: document.pageContent,
    created_at: String(metadata.created_at || new Date().toISOString()),
    similarity,
  };
};

export const insertJobChunk = async (
  jobId: string,
  handler: string,
  category: string,
  hasError: boolean,
  content: string,
  embedding: number[],
): Promise<void> => {
  const createdAt = new Date().toISOString();

  const vectorLiteral = `[${embedding.join(",")}]`;
  await query(
    `
      INSERT INTO job_chunks (job_id, handler, content, embedding, metadata, created_at)
      VALUES ($1, $2, $3, $4::vector, $5::jsonb, $6)
    `,
    [
      jobId,
      handler,
      content,
      vectorLiteral,
      JSON.stringify({
        job_id: jobId,
        handler,
        category,
        hasError,
        created_at: createdAt,
      }),
      createdAt,
    ],
  );
};

export const searchJobChunksByColumnsWithEmbedding = async (
  embedding: number[],
  filters: RAGFilters,
  limit: number,
): Promise<RetrievedChunk[]> => {
  const vectorLiteral = `[${embedding.join(",")}]`;
  const params: (string | number | null)[] = [vectorLiteral];
  const whereClauses: string[] = [];

  if (filters.job_id) {
    params.push(filters.job_id);
    whereClauses.push(`job_id = $${params.length}`);
  }

  if (filters.handler) {
    params.push(filters.handler);
    whereClauses.push(`handler = $${params.length}`);
  }

  params.push(limit);
  const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const result = await query(
    `
      SELECT
        job_id,
        handler,
        content,
        metadata,
        created_at,
        (1 - (embedding <=> $1::vector)) AS similarity
      FROM job_chunks
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT $${params.length}
    `,
    params,
  );

  return result.rows.map((row) => {
    const metadata = (row.metadata ?? {}) as Record<string, unknown>;

    return {
      id: Number(row.id ?? 0),
      job_id: String(row.job_id ?? metadata.job_id ?? ""),
      handler: String(row.handler ?? metadata.handler ?? "unknown"),
      content: String(row.content ?? ""),
      created_at: String(row.created_at ?? metadata.created_at ?? new Date().toISOString()),
      similarity: Number(row.similarity ?? 0),
    };
  });
};

export const searchChunksHybrid = async (
  embedding: number[],
  filters: RAGFilters,
  limit: number,
): Promise<RetrievedChunk[]> => {
  const vectorStore = await getPgVectorStore();
  const filter = toFilter(filters);
  const results = await vectorStore.similaritySearchVectorWithScore(
    embedding,
    limit,
    Object.keys(filter).length ? filter : undefined,
  );

  return results.map(([document, score]) =>
    toRetrievedChunk(
      {
        id: document.id,
        pageContent: document.pageContent,
        metadata: (document.metadata ?? {}) as Record<string, unknown>,
      },
      score,
    ),
  );
};
