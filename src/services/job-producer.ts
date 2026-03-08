import { JobMessage } from "../dto/job-message-dto";
import { JobHandlerFactory } from "../factory/job-handler-factory";
import { Job } from "../models/job-model";
import { getQueueByCategory, retryRouteQueue } from "../queues/job-queues";

const parseDurationToMs = (value: string): number => {
  const match = value.trim().match(/^(\d+)(ms|s|m|h)$/i);
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "ms") return amount;
  if (unit === "s") return amount * 1000;
  if (unit === "m") return amount * 60_000;
  return amount * 3_600_000;
};

export const pushJobToQueue = async (job: Job): Promise<void> => {
  if (!job.id) return;
  const queue = getQueueByCategory(job.category);
  const handler = JobHandlerFactory.get(job.handler);
  const retries = handler.retries();
  const backoff = handler.backoff();
  // check behavior of this
  const attempts = Math.max(1, retries + 1);
  const firstBackoff = backoff.length > 0 ? parseDurationToMs(backoff[0]) : 1000;

  const payload: JobMessage = {
    jobId: job.id!,
    jobCategory: job.category,
    jobHandler: job.handler,
    data: job.data || {},
  };

  await queue.add(`${job.id}-job`, payload, {
    attempts,
    backoff: {
      type: "fixed",
      delay: firstBackoff,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};

export const pushJobToRetryQueue = async (job: Job): Promise<void> => {
  if (!job.id) return;
  const payload: JobMessage = {
    jobId: job.id,
    jobCategory: job.category,
    jobHandler: job.handler,
    data: job.data || {},
  };

  await retryRouteQueue.add("retry-job", payload);
};
