import { create } from "../repositories/job-repository";
import { Job } from "../models/job-model";
import { JobHandlerTypes, JobCategories } from "../enums/job-enums";
import { jobData } from "../types/job-types";
import { pushJobToQueue } from "./job-producer";
import { getJobHandlerCategoryFromType } from "../managers/job-manager";

export const createAndPublishJob = async (
  jobHandlerType: JobHandlerTypes,
  jobData: jobData,
): Promise<string> => {
  const jobCategory: JobCategories = getJobHandlerCategoryFromType(jobHandlerType);
  if (!jobCategory) {
    throw new Error(`No category found for job handler type: ${jobHandlerType}`);
  }

  const job: Job = new Job(jobHandlerType, jobCategory, jobData);
  const createdJob: Job = await create(job);
  if (!createdJob.id) {
    throw new Error("Failed to create job in the database");
  }

  await pushJobToQueue(job);

  return job.id;
};
