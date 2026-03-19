import { RAGFilters, RetrievedChunk } from "../dto/rag-dtos";
import { getPgVectorStore } from "../services/langchain-pgvector-service";

const toFilter = (filters: RAGFilters): Record<string, string> => {
  const normalized: Record<string, string> = {};

  if (filters.handler) {
    normalized.handler = filters.handler;
  }

  if (filters.log_level) {
    normalized.log_level = filters.log_level.toUpperCase();
  }

  if (filters.log_source) {
    normalized.log_source = filters.log_source.toUpperCase();
  }

  if (filters.log_stream) {
    normalized.log_stream = filters.log_stream.toUpperCase();
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
    log_level: String(metadata.log_level || "INFO"),
    log_source: String(metadata.log_source || "SYSTEM"),
    log_stream: String(metadata.log_stream || "APPLICATION"),
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
  const vectorStore = await getPgVectorStore();
  await vectorStore.addVectors(
    [embedding],
    [
      {
        pageContent: content,
        metadata: {
          job_id: jobId,
          handler,
          category,
          hasError,
          created_at: new Date().toISOString(),
        },
      },
    ],
  );
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
