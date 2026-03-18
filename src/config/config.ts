import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    url: process.env.REDIS_URL,
    windowSize: parseInt(process.env.RAG_WINDOW_SIZE || "4", 10),
    lockTtlMs: parseInt(process.env.RAG_LOCK_TTL_MS || "5000", 10),
  },
  rag: {
    embeddingDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || "782", 10),
    retentionDays: parseInt(process.env.RAG_RETENTION_DAYS || "14", 10),
    topK: parseInt(process.env.RAG_TOP_K || "10", 10),
  },
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY,
    baseUrl: process.env.GOOGLE_API_BASE_URL,
    chatModel: process.env.GEMINI_CHAT_MODEL,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL,
  },
};
