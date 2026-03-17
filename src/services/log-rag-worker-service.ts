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

const summarizeMessage = (message: string): string => {
  if (!message) {
    return "No message details available";
  }

  const eventMatch = message.match(/event=([^\s]+)/);
  if (eventMatch?.[1]) {
    return eventMatch[1].replace(/\./g, " ").replace(/_/g, " ").trim();
  }

  return message.trim();
};

const buildChunkText = (handler: string, logs: LogIngestionPayload[]): string => {
  const level = logs.some((log) => log.log_level === "ERROR")
    ? "ERROR"
    : logs[logs.length - 1].log_level;
  const sequence = logs
    .map((log) => `- [${log.log_source}/${log.log_stream}] ${summarizeMessage(log.message)}`)
    .join("\n");

  return `Handler: ${handler}\nLevel: ${level}\n\nSequence:\n${sequence}`;
};

const persistChunk = async (jobId: string, logs: LogIngestionPayload[]): Promise<void> => {
  if (logs.length === 0) {
    return;
  }

  const latestLog = logs[logs.length - 1];
  const chunkText = buildChunkText(latestLog.handler, logs);
  const embedding = await embedText(chunkText);
  const effectiveLevel = logs.some((log) => log.log_level === "ERROR")
    ? "ERROR"
    : latestLog.log_level;
  const sourceSet = new Set(logs.map((log) => log.log_source));
  const streamSet = new Set(logs.map((log) => log.log_stream));
  const effectiveSource = sourceSet.size === 1 ? logs[0].log_source : "MIXED";
  const effectiveStream = streamSet.size === 1 ? logs[0].log_stream : "MIXED";

  await insertJobChunk(
    jobId,
    latestLog.handler,
    effectiveLevel,
    effectiveSource,
    effectiveStream,
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
      log_stream: log.log_stream || "APPLICATION",
    }));

    await persistChunk(jobId, normalizedLogs);
    await clearLogs(jobId);
  } finally {
    await releaseJobLock(jobId, lockToken);
  }

  Logger.info(`event=rag.job.finalized jobId=${jobId}`);
};
