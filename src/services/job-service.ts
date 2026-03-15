import {
  create,
  findAll,
  findAllPaginated,
  findDashboardJobById,
  findUpdatedSince,
  findUpdatedSincePaginated,
  updateHistory,
} from "../repositories/job-repository";
import { Job } from "../models/job-model";
import { JobHandlerTypes, JobCategories, JobStatuses } from "../enums/job-enums";
import { jobData } from "../types/job-types";
import { DashboardJob, DashboardJobQueryOptions, PaginatedDashboardJobs } from "../types/job-types";
import { pushJobToQueue } from "./job-producer";
import { getJobHandlerCategoryFromType } from "../managers/job-manager";
import { Logger } from "./log-service";

export const createAndPublishJob = async (
  jobHandlerType: JobHandlerTypes,
  jobData: jobData,
): Promise<string> => {
  Logger.info(`event=job.create.requested handler=${jobHandlerType}`);
  const jobCategory: JobCategories = getJobHandlerCategoryFromType(jobHandlerType);
  if (!jobCategory) {
    Logger.error(`event=job.create.invalid_handler handler=${jobHandlerType}`);
    throw new Error(`No category found for job handler type: ${jobHandlerType}`);
  }

  const job: Job = new Job(jobHandlerType, jobCategory, jobData);
  const createdJob: Job = await create(job);
  if (!createdJob.id) {
    Logger.error(
      `event=job.create.persist_failed handler=${jobHandlerType} category=${jobCategory}`,
    );
    throw new Error("Failed to create job in the database");
  }
  Logger.info(
    `event=job.create.persisted jobId=${job.id} handler=${jobHandlerType} category=${jobCategory}`,
  );

  const publishSucceeded = await pushJobToQueue(job);
  if (!publishSucceeded) {
    Logger.error(
      `event=job.create.publish_failed jobId=${job.id} handler=${jobHandlerType} category=${jobCategory}`,
    );
    await updateHistory(job.id, JobStatuses.ERROR, "Failed to publish job to queue");
    throw new Error("Failed to publish job to queue");
  }

  await updateHistory(job.id, JobStatuses.PUBLISHED);
  Logger.info(
    `event=job.create.completed jobId=${job.id} handler=${jobHandlerType} category=${jobCategory}`,
  );

  return job.id;
};

export const getJobById = async (id: string): Promise<DashboardJob | null> => {
  return findDashboardJobById(id);
};

export const getAllJobs = async (
  options: DashboardJobQueryOptions = {},
): Promise<DashboardJob[]> => {
  return findAll(options);
};

export const getUpdatedJobs = async (
  since: Date,
  options: DashboardJobQueryOptions = {},
): Promise<DashboardJob[]> => {
  return findUpdatedSince(since, options);
};

export const getAllJobsPaginated = async (
  options: DashboardJobQueryOptions,
  page: number,
  limit: number,
): Promise<PaginatedDashboardJobs> => {
  return findAllPaginated(options, page, limit);
};

export const getUpdatedJobsPaginated = async (
  since: Date,
  options: DashboardJobQueryOptions,
  page: number,
  limit: number,
): Promise<PaginatedDashboardJobs> => {
  return findUpdatedSincePaginated(since, options, page, limit);
};
