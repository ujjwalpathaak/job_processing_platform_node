import { Queue } from "bullmq";
import { config } from "../config/config";
import * as JobEnums from "../enums/job-enums";

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

export const standardQueue = new Queue("standard.jobs", { connection });
export const externalQueue = new Queue("external.jobs", { connection });
export const criticalQueue = new Queue("critical.jobs", { connection });
export const retryRouteQueue = new Queue("retry.route.queue", { connection });

const categoryQueueMap: Record<JobEnums.Categories, Queue> = {
  [JobEnums.Categories.STANDARD]: standardQueue,
  [JobEnums.Categories.EXTERNAL]: externalQueue,
  [JobEnums.Categories.CRITICAL]: criticalQueue,
};

export const getQueueByCategory = (category: JobEnums.Categories): Queue => {
  return categoryQueueMap[category];
};
