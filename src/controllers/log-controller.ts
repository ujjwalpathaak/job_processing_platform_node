import { Request, Response } from "express";
import ApiResponse from "../dto/api-dtos";
import {
  JobCompletedPayload,
  LogIngestionPayload,
  RAGQueryRequest,
  LogRagLevel,
} from "../dto/rag-dtos";
import { publishJobCompletedForRag, publishLogForRag } from "../services/log-rag-producer";
import { runRagQuery } from "../services/rag-query-service";
import { cleanupExpiredJobChunks } from "../services/job-chunk-retention-service";

const isValidLogLevel = (level: string): level is LogRagLevel => {
  return ["INFO", "ERROR", "WARN", "DEBUG"].includes(level);
};

export const ingestLog = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Partial<LogIngestionPayload>;

  if (!payload.job_id || !payload.handler || !payload.message) {
    return res.status(400).json(ApiResponse.failure("job_id, handler and message are required"));
  }

  const normalizedLevel = String(payload.log_level || "INFO").toUpperCase();
  if (!isValidLogLevel(normalizedLevel)) {
    return res.status(400).json(ApiResponse.failure("Invalid log_level"));
  }

  const timestamp = Number(payload.timestamp || Date.now());
  if (!Number.isFinite(timestamp)) {
    return res.status(400).json(ApiResponse.failure("Invalid timestamp"));
  }

  const accepted = await publishLogForRag({
    job_id: payload.job_id,
    handler: payload.handler,
    log_level: normalizedLevel,
    message: payload.message,
    timestamp,
  });

  if (!accepted) {
    return res.status(503).json(ApiResponse.failure("Unable to enqueue log event"));
  }

  return res.status(202).json(ApiResponse.success(undefined, "Log accepted for async processing"));
};

export const notifyJobCompleted = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Partial<JobCompletedPayload>;

  if (!payload.job_id) {
    return res.status(400).json(ApiResponse.failure("job_id is required"));
  }

  const accepted = await publishJobCompletedForRag(payload.job_id, payload.handler);
  if (!accepted) {
    return res.status(503).json(ApiResponse.failure("Unable to enqueue completion event"));
  }

  return res.status(202).json(ApiResponse.success(undefined, "Completion event accepted"));
};

export const ragQuery = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Partial<RAGQueryRequest>;
  if (!payload.query || !payload.query.trim()) {
    return res.status(400).json(ApiResponse.failure("query is required"));
  }

  const result = await runRagQuery(payload.query, payload.topK);
  return res.status(200).json(ApiResponse.success(result, "RAG query completed"));
};

export const triggerRetentionCleanup = async (_req: Request, res: Response): Promise<Response> => {
  const deletedCount = await cleanupExpiredJobChunks();
  return res.status(200).json(ApiResponse.success({ deletedCount }, "Retention cleanup completed"));
};
