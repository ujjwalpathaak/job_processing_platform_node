import JobRepository from "../repositories/job-repository";
import { Job } from "../models/Job";
import { NewJob } from "../interfaces/Job";
import * as JobEnums from "../enums/Job";
import JobManager from "../managers/job-manager";
import { jobData } from "../types/job";

const JobService = {
  async createJob(jobHandlerType: JobEnums.HandlerTypes, jobData: jobData): Promise<NewJob> {
    const jobCategory: JobEnums.Categories =
      JobManager.getJobHandlerCategoryFromType(jobHandlerType);
    if (!jobCategory) {
      throw new Error(`No category found for job handler type: ${jobHandlerType}`);
    }

    const job: Job = new Job(jobHandlerType, jobCategory, jobData);
    return await JobRepository.create(job);
  },
};

export default JobService;
// export const getAllJobs = async (): Promise<Job[]> => {
//   return jobRepository.findAll();
// };

// export const getJobById = async (id: number): Promise<Job | null> => {
//   return jobRepository.findById(id);
// };

// export const getJobsUpdatedSince = async (since: Date): Promise<Job[]> => {
//   return jobRepository.findUpdatedSince(since);
// };

// export const createJob = async (data: CreateJobRequest): Promise<NewJob> => {
//   return await jobRepository.create(data);
// };

// export const updateJob = async (id: number, data: UpdateJobRequest): Promise<Job | null> => {
//   return jobRepository.update(id, data);
// };

// export const deleteJob = async (id: number): Promise<boolean> => {
//   return jobRepository.delete_(id);
// };

// export const updateJobStatus = async (
//   id: number,
//   status: JobEnums.Statuses,
//   error?: string,
// ): Promise<Job | null> => {
//   return jobRepository.addHistory(id, status, error);
// };
