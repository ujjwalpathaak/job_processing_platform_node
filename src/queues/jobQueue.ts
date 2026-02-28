import { Queue } from "bullmq";
import { config } from "../config";
import { JobCategory } from "../enums";

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

export const standardQueue = new Queue("standard.jobs", { connection });
export const externalQueue = new Queue("external.jobs", { connection });
export const criticalQueue = new Queue("critical.jobs", { connection });
export const retryRouteQueue = new Queue("retry.route.queue", { connection });

const categoryQueueMap: Record<JobCategory, Queue> = {
  [JobCategory.STANDARD]: standardQueue,
  [JobCategory.EXTERNAL]: externalQueue,
  [JobCategory.CRITICAL]: criticalQueue,
};

export const getQueueByCategory = (category: JobCategory): Queue => {
  return categoryQueueMap[category];
};

const queue = standardQueue;

export default queue;
