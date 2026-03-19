import { randomUUID } from "crypto";
import { getRedis } from "../config/redis";
import { config } from "../config/config";
import { LogIngestionPayload } from "../dto/rag-dtos";

const LOG_KEY_PREFIX = "job:";
const LOCK_SUFFIX = ":lock";
const LOCK_RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

const getJobKey = (jobId: string): string => `${LOG_KEY_PREFIX}${jobId}`;
const getLockKey = (jobId: string): string => `${getJobKey(jobId)}${LOCK_SUFFIX}`;

const createMemberValue = (log: LogIngestionPayload): string => {
  return JSON.stringify({
    id: randomUUID(),
    ...log,
  });
};

export const pushLogToBuffer = async (log: LogIngestionPayload): Promise<void> => {
  const redis = getRedis();
  const memberValue = createMemberValue(log);
  await redis.zadd(getJobKey(log.job_id), `${log.timestamp}`, memberValue);
};

export const getRecentLogs = async (
  jobId: string,
  windowSize: number = config.redis.windowSize,
): Promise<LogIngestionPayload[]> => {
  const redis = getRedis();
  const rows = await redis.zrange(getJobKey(jobId), -windowSize, -1);

  return rows
    .map((row) => JSON.parse(row) as LogIngestionPayload)
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const getAllLogs = async (jobId: string): Promise<LogIngestionPayload[]> => {
  const redis = getRedis();
  const rows = await redis.zrange(getJobKey(jobId), 0, -1);

  return rows
    .map((row) => JSON.parse(row) as LogIngestionPayload)
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const trimOldestLog = async (jobId: string, count: number = 1): Promise<void> => {
  if (count <= 0) {
    return;
  }

  const redis = getRedis();
  await redis.zremrangebyrank(getJobKey(jobId), 0, count - 1);
};

export const clearLogs = async (jobId: string): Promise<void> => {
  const redis = getRedis();
  await redis.del(getJobKey(jobId));
};

//simplify
export const acquireJobLock = async (jobId: string): Promise<string | null> => {
  const redis = getRedis();
  const token = randomUUID();
  const lock = await redis.set(getLockKey(jobId), token, "PX", config.redis.lockTtlMs, "NX");

  return lock === "OK" ? token : null;
};

//simplify
export const releaseJobLock = async (jobId: string, token: string): Promise<void> => {
  const redis = getRedis();
  await redis.eval(LOCK_RELEASE_SCRIPT, 1, getLockKey(jobId), token);
};
