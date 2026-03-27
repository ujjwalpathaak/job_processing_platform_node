import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number.parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      max: Number.parseInt(process.env.DB_POOL_MAX || "50", 10),
      min: Number.parseInt(process.env.DB_POOL_MIN || "5", 10),
      idleTimeoutMs: Number.parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || "30000", 10),
      connectionTimeoutMs: Number.parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS || "5000", 10),
    },
  },
  rabbit: {
    url: process.env.AMQP_URL || "amqp://localhost",
    publishDrainTimeoutMs: Number.parseInt(process.env.AMQP_PUBLISH_DRAIN_TIMEOUT_MS || "2000", 10),
    prefetch: {
      standard: Number.parseInt(process.env.AMQP_PREFETCH_STANDARD || "32", 10),
      critical: Number.parseInt(process.env.AMQP_PREFETCH_CRITICAL || "32", 10),
      external: Number.parseInt(process.env.AMQP_PREFETCH_EXTERNAL || "24", 10),
      retry: Number.parseInt(process.env.AMQP_PREFETCH_RETRY || "64", 10),
      logRag: Number.parseInt(process.env.AMQP_PREFETCH_LOG_RAG || "8", 10),
    },
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
    url: process.env.REDIS_URL,
    windowSize: Number.parseInt(process.env.RAG_WINDOW_SIZE || "5", 10),
    lockTtlMs: Number.parseInt(process.env.RAG_LOCK_TTL_MS || "5000", 10),
  },
  rag: {
    enabled: process.env.RAG_INGESTION_ENABLED
      ? process.env.RAG_INGESTION_ENABLED.toLowerCase() === "true"
      : true,
    embeddingDimensions: Number.parseInt(process.env.EMBEDDING_DIMENSIONS || "782", 10),
    retentionDays: Number.parseInt(process.env.RAG_RETENTION_DAYS || "14", 10),
    topK: Number.parseInt(process.env.RAG_TOP_K || "10", 10),
    consumerMaxInFlight: Number.parseInt(process.env.RAG_CONSUMER_MAX_IN_FLIGHT || "4", 10),
    consumerMaxPerSecond: Number.parseInt(process.env.RAG_CONSUMER_MAX_PER_SECOND || "12", 10),
  },
  handlerFailureRate: {
    email: Number.parseFloat(process.env.HANDLER_FAILURE_RATE_EMAIL || "0.05"),
    refund: Number.parseFloat(process.env.HANDLER_FAILURE_RATE_REFUND || "0.05"),
    webhook: Number.parseFloat(process.env.HANDLER_FAILURE_RATE_WEBHOOK || "0.08"),
    crmSync: Number.parseFloat(process.env.HANDLER_FAILURE_RATE_CRM_SYNC || "0.1"),
  },
  handlerDelayMs: {
    emailMin: Number.parseInt(process.env.HANDLER_DELAY_EMAIL_MIN_MS || "30", 10),
    emailMax: Number.parseInt(process.env.HANDLER_DELAY_EMAIL_MAX_MS || "120", 10),
    refundMin: Number.parseInt(process.env.HANDLER_DELAY_REFUND_MIN_MS || "100", 10),
    refundMax: Number.parseInt(process.env.HANDLER_DELAY_REFUND_MAX_MS || "400", 10),
    webhookMin: Number.parseInt(process.env.HANDLER_DELAY_WEBHOOK_MIN_MS || "400", 10),
    webhookMax: Number.parseInt(process.env.HANDLER_DELAY_WEBHOOK_MAX_MS || "1800", 10),
    crmSyncMin: Number.parseInt(process.env.HANDLER_DELAY_CRM_SYNC_MIN_MS || "300", 10),
    crmSyncMax: Number.parseInt(process.env.HANDLER_DELAY_CRM_SYNC_MAX_MS || "1200", 10),
    reportMin: Number.parseInt(process.env.HANDLER_DELAY_REPORT_MIN_MS || "2500", 10),
    reportMax: Number.parseInt(process.env.HANDLER_DELAY_REPORT_MAX_MS || "4000", 10),
  },
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY,
    baseUrl: process.env.GOOGLE_API_BASE_URL,
    chatModel: process.env.GEMINI_CHAT_MODEL,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL,
  },
};
