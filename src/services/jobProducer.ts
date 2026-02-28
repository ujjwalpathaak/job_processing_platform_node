import { JobMessage } from "../dto/JobMessage";
import { jobHandlerFactory } from "../factory/jobHandlerFactory";
import { Job } from "../models/Job";
import { getQueueByCategory, retryRouteQueue } from "../queues/jobQueue";

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

export const addJob = async (job: Job): Promise<void> => {
  const queue = getQueueByCategory(job.jobCategory);
  const handler = jobHandlerFactory.get(job.jobHandler, job.jobCategory);
  const retries = handler.retries();
  const backoff = handler.backoff();
  const attempts = Math.max(1, retries + 1);
  const firstBackoff = backoff.length > 0 ? parseDurationToMs(backoff[0]) : 1000;

  const payload: JobMessage = {
    jobId: job.id,
    jobCategory: job.jobCategory,
    jobHandler: job.jobHandler,
    data: job.data || {},
  };

  await queue.add("job", payload, {
    attempts,
    backoff: {
      type: "fixed",
      delay: firstBackoff,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};

export const addRetryRouteJob = async (job: Job): Promise<void> => {
  const payload: JobMessage = {
    jobId: job.id,
    jobCategory: job.jobCategory,
    jobHandler: job.jobHandler,
    data: job.data || {},
  };

  await retryRouteQueue.add("retry-job", payload);
};
