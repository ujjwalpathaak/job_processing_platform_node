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
    attempt: 1,
  };

  Logger.info(
    `Publishing job message to queue | queue=${queue} | attempt=${payload.attempt}`,
    payload.id,
    payload.handler,
  );
  const published = await rabbit.publish(queue, JSON.stringify(payload));
  if (!published) {
    Logger.error(
      `Primary queue publish failed | queue=${queue}`,
      payload.id,
      payload.handler,
      undefined,
      true,
    );
    return false;
  }

  Logger.info(`Queue publish succeeded`, payload.id, payload.handler, undefined, true);
  return true;
};

export const pushMessageToRetryQueue = async (
  message: JobMessage,
  backoffValue?: string,
): Promise<boolean> => {
  const rabbit = await Rabbit.getInstance();
  const retryQueue = resolveRetryQueue(backoffValue);
  Logger.info(
    `Publishing job message to retry | queue=${retryQueue} | attempt=${message.attempt ?? 0} | backoff=${backoffValue ?? "default"}`,
    message.id,
    message.handler,
    undefined,
    true,
  );
  const published = await rabbit.publish(retryQueue, JSON.stringify(message));
  if (!published) {
    Logger.error(`Retry queue publish failed`, message.id, message.handler, undefined, true);
    return false;
  }

  Logger.info(`Retry queue publish succeeded`, message.id, message.handler, undefined, true);
  return true;
};
