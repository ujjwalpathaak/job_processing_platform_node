import { config } from "../config/config";
import { LogIngestionPayload } from "../dto/rag-dtos";
import {
  acquireJobLock,
  clearLogs,
  getAllLogs,
  getRecentLogs,
  pushLogToBuffer,
  releaseJobLock,
  trimOldestLog,
} from "./log-buffer-service";
import { embedText } from "./embedding-service";
import { insertJobChunk } from "../repositories/job-chunk-repository";
import { Logger } from "./log-service";
import * as Log from "../enums/log-enums";
import { getJobHandlerCategoryFromType, isValidJobHandlerType } from "../managers/job-manager";
import { JobHandlerTypes } from "../enums/job-enums";

const resolveCategoryFromHandler = (handler: string): string => {
  if (!isValidJobHandlerType(handler)) {
    return "UNKNOWN";
  }

  return getJobHandlerCategoryFromType(handler as JobHandlerTypes);
};

const buildChunkText = (handler: string, logs: LogIngestionPayload[]): string => {
  const category = resolveCategoryFromHandler(handler);
  const level = logs.some((log) => log.log_level === Log.Level.ERROR)
    ? Log.Level.ERROR
    : logs[logs.length - 1].log_level;
  const sequence = logs
    .map((log) => `- [${log.log_source}/${log.log_level}] ${log.message}`)
    .join("\n");

  return `Handler: ${handler}\nCategory: ${category}\nLevel: ${level}\n\nSequence:\n${sequence}`;
};

const persistChunk = async (jobId: string, logs: LogIngestionPayload[]): Promise<void> => {
  if (logs.length === 0) {
    return;
  }

  const latestLog = logs[logs.length - 1];
  const chunkText = buildChunkText(latestLog.handler, logs);
  const embedding = await embedText(chunkText);
  const effectiveLevel = logs.some((log) => log.log_level === Log.Level.ERROR)
    ? Log.Level.ERROR
    : latestLog.log_level;
  const sourceSet = new Set(logs.map((log) => log.log_source));
  const effectiveSource = sourceSet.size === 1 ? logs[0].log_source : "MIXED";
  const category = resolveCategoryFromHandler(latestLog.handler);

  await insertJobChunk(
    jobId,
    latestLog.handler,
    category,
    effectiveLevel,
    effectiveSource,
    "effectiveStream",
    chunkText,
    embedding,
  );
};

export const processLogForRag = async (log: LogIngestionPayload): Promise<void> => {
  await pushLogToBuffer(log);

  const lockToken = await acquireJobLock(log.job_id);
  if (!lockToken) {
    return;
  }

  try {
    const logs = await getRecentLogs(log.job_id, config.redis.windowSize);
    if (logs.length < config.redis.windowSize) {
      return;
    }

    await persistChunk(log.job_id, logs);
    await trimOldestLog(log.job_id);
  } finally {
    await releaseJobLock(log.job_id, lockToken);
  }
};

export const finalizeJobLogsForRag = async (
  jobId: string,
  fallbackHandler: string = "unknown",
): Promise<void> => {
  const lockToken = await acquireJobLock(jobId);
  if (!lockToken) {
    return;
  }

  try {
    const bufferedLogs = await getAllLogs(jobId);
    if (bufferedLogs.length === 0) {
      return;
    }

    const normalizedLogs = bufferedLogs.map((log) => ({
      ...log,
      handler: log.handler || fallbackHandler,
      log_source: log.log_source || "SYSTEM",
    }));

    await persistChunk(jobId, normalizedLogs);
    await clearLogs(jobId);
  } finally {
    await releaseJobLock(jobId, lockToken);
  }

  Logger.info("rag | job finalized", jobId, fallbackHandler);
};
