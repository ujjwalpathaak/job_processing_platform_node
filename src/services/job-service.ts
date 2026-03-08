import { createNewJob } from "../repositories/job-repository";
import { Job } from "../models/job-model";
import * as JobEnums from "../enums/job-enums";
import { jobData } from "../types/job-types";
import { pushJobToQueue } from "./job-producer";
import { getJobHandlerCategoryFromType } from "../managers/job-manager";

export const createAndPublishJob = async (
  jobHandlerType: JobEnums.HandlerTypes,
  jobData: jobData,
): Promise<Job> => {
  const jobCategory: JobEnums.Categories = getJobHandlerCategoryFromType(jobHandlerType);
  if (!jobCategory) {
    throw new Error(`No category found for job handler type: ${jobHandlerType}`);
  }

  const job: Job = new Job(jobHandlerType, jobCategory, jobData);

  await createNewJob(job);
  await publishJob(job);

  return job;
};

export const publishJob = async (job: Job) => {
  await pushJobToQueue(job);
};
