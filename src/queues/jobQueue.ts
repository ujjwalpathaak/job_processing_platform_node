import { Queue } from "bullmq";
import { config } from "../config";
import * as Job from "../enums/Job";

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

export const standardQueue = new Queue("standard.jobs", { connection });
export const externalQueue = new Queue("external.jobs", { connection });
export const criticalQueue = new Queue("critical.jobs", { connection });
export const retryRouteQueue = new Queue("retry.route.queue", { connection });

const categoryQueueMap: Record<Job.Categories, Queue> = {
  [Job.Categories.STANDARD]: standardQueue,
  [Job.Categories.EXTERNAL]: externalQueue,
  [Job.Categories.CRITICAL]: criticalQueue,
};

export const getQueueByCategory = (category: Job.Categories): Queue => {
  return categoryQueueMap[category];
};

const queue = standardQueue;

export default queue;
