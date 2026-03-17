import Redis from "ioredis";
import { config } from "./config";

let redisInstance: Redis | null = null;

export const getRedis = (): Redis => {
  if (redisInstance) {
    return redisInstance;
  }

  redisInstance = config.redis.url
    ? new Redis(config.redis.url)
    : new Redis({
        host: config.redis.host,
        port: config.redis.port,
      });

  return redisInstance;
};

export const closeRedis = async (): Promise<void> => {
  if (!redisInstance) {
    return;
  }

  await redisInstance.quit();
  redisInstance = null;
};
