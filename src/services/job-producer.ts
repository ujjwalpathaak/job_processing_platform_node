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
    `publish attempt | queue=${queue} | attempt=${payload.attempt}`,
    payload.id,
    payload.handler,
  );
  const published = rabbit.publish(queue, JSON.stringify(payload));
  if (!published) {
    Logger.error(`publish failed | queue=${queue}`, payload.id);
    return false;
  }

  Logger.info(`publish success | queue=${queue}`, payload.id);
  return true;
};

export const pushMessageToRetryQueue = async (
  message: JobMessage,
  backoffValue?: string,
): Promise<boolean> => {
  const rabbit = await Rabbit.getInstance();
  const retryQueue = resolveRetryQueue(backoffValue);
  Logger.info(
    `retry publish attempt | queue=${retryQueue} | attempt=${message.attempt ?? 0} | backoff=${backoffValue ?? "default"}`,
    message.id,
    message.handler,
  );
  const published = rabbit.publish(retryQueue, JSON.stringify(message));
  if (!published) {
    Logger.error(`retry publish failed | queue=${retryQueue}`, message.id);
    return false;
  }

  Logger.info(`retry publish success | queue=${retryQueue}`, message.id);
  return true;
};
