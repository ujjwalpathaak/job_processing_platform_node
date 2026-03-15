import { Rabbit } from "../config/rabbit";
import { JobMessage } from "../dto/job-dtos";
import { Queue, resolveRetryQueue } from "../enums/queue-enums";
import { Job } from "../models/job-model";

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

  return rabbit.publish(queue, JSON.stringify(payload));
};

export const pushMessageToRetryQueue = async (
  message: JobMessage,
  backoffValue?: string,
): Promise<boolean> => {
  const rabbit = await Rabbit.getInstance();
  const retryQueue = resolveRetryQueue(backoffValue);
  return rabbit.publish(retryQueue, JSON.stringify(message));
};
