import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { config } from "../config/config";
import { getEmbeddingsClient } from "./embedding-service";

let vectorStorePromise: Promise<PGVectorStore> | null = null;

export const getPgVectorStore = async (): Promise<PGVectorStore> => {
  if (!config.database.url) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!vectorStorePromise) {
    vectorStorePromise = PGVectorStore.initialize(getEmbeddingsClient(), {
      postgresConnectionOptions: {
        connectionString: config.database.url,
      },
      tableName: "job_chunks",
      collectionTableName: "job_chunk_collections",
      collectionName: "job_processing_rag",
      columns: {
        idColumnName: "id",
        vectorColumnName: "embedding",
        contentColumnName: "content",
        metadataColumnName: "metadata",
      },
      distanceStrategy: "cosine",
      scoreNormalization: "similarity",
      dimensions: config.rag.embeddingDimensions,
    });
  }

  return vectorStorePromise;
};
