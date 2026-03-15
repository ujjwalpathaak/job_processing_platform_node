import { Rabbit } from "../config/rabbit";
import { JobMessage } from "../dto/job-dtos";
import { JobCategories } from "../enums/job-enums";
import { Queue } from "../enums/queue-enums";
import { Job } from "../models/job-model";

export const pushJobToQueue = async (job: Job): Promise<void> => {
  if (!job.id) return;
  const rabbit = await Rabbit.getInstance();
  const queue = rabbit.getQueueByCategory(job.category as keyof typeof JobCategories);

  const payload: JobMessage = {
    id: job.id!,
    category: job.category,
    handler: job.handler,
    data: job.data || {},
  };

  rabbit.publish(queue, JSON.stringify(payload));
};

export const pushJobToRetryQueue = async (job: Job): Promise<void> => {
  if (!job.id) return;
  const rabbit = await Rabbit.getInstance();

  const payload: JobMessage = {
    id: job.id,
    category: job.category,
    handler: job.handler,
    data: job.data || {},
  };

  await rabbit.publish(Queue.RETRY5SEC, JSON.stringify(payload));
};
