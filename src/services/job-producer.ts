import { Rabbit } from "../config/rabbit";
import { JobMessage } from "../dto/job-dtos";
import { Queues } from "../enums/queue-enums";
import { Job } from "../models/job-model";

export const pushJobToQueue = async (job: Job): Promise<void> => {
  if (!job.id) return;
  const rabbit = await Rabbit.getInstance();
  const queue = rabbit.getQueueByCategory(job.category);

  const payload: JobMessage = {
    jobId: job.id!,
    jobCategory: job.category,
    jobHandler: job.handler,
    data: job.data || {},
  };

  rabbit.publish(queue, JSON.stringify(payload));
};

export const pushJobToRetryQueue = async (job: Job): Promise<void> => {
  if (!job.id) return;
  const rabbit = await Rabbit.getInstance();

  const payload: JobMessage = {
    jobId: job.id,
    jobCategory: job.category,
    jobHandler: job.handler,
    data: job.data || {},
  };

  await rabbit.publish(Queues.RETRY5SEC, JSON.stringify(payload));
};
