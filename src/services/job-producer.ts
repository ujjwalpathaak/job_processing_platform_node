import { Rabbit } from "../config/rabbit";
import { JobMessage } from "../dto/job-dtos";
import { Queue, resolveRetryQueue } from "../enums/queue-enums";
import { Job } from "../models/job-model";
import { Logger } from "./log-service";

export const pushJobToQueue = async (job: Job): Promise<boolean> => {
  if (!job.id) return false;
  const rabbit = await Rabbit.getInstance();
  const queue: Queue = rabbit.getQueueByCategory(job.category);

  const payload: JobMessage = {
    id: job.id!,
    category: job.category,
    handler: job.handler,
    data: job.data || {},
    attempt: 0,
  };

  Logger.info(
    `event=job.publish.attempt queue=${queue} jobId=${payload.id} handler=${payload.handler} category=${payload.category} attempt=${payload.attempt}`,
  );
  const published = rabbit.publish(queue, JSON.stringify(payload));
  if (!published) {
    Logger.error(`event=job.publish.failed queue=${queue} jobId=${payload.id}`);
    return false;
  }

  Logger.info(`event=job.publish.succeeded queue=${queue} jobId=${payload.id}`);
  return true;
};

export const pushMessageToRetryQueue = async (
  message: JobMessage,
  backoffValue?: string,
): Promise<boolean> => {
  const rabbit = await Rabbit.getInstance();
  const retryQueue = resolveRetryQueue(backoffValue);
  Logger.info(
    `event=job.retry.publish_attempt queue=${retryQueue} jobId=${message.id} handler=${message.handler} attempt=${message.attempt ?? 0} backoff=${backoffValue ?? "default"}`,
  );
  const published = rabbit.publish(retryQueue, JSON.stringify(message));
  if (!published) {
    Logger.error(`event=job.retry.publish_failed queue=${retryQueue} jobId=${message.id}`);
    return false;
  }

  Logger.info(`event=job.retry.publish_succeeded queue=${retryQueue} jobId=${message.id}`);
  return true;
};
