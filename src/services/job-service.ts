import JobRepository from "../repositories/job-repository";
import { Job } from "../models/job-model";
import * as JobEnums from "../enums/job-enums";
import JobManager from "../managers/job-manager";
import { jobData } from "../types/job-types";

const JobService = {
  async createAndPublishJob(jobHandlerType: JobEnums.HandlerTypes, jobData: jobData): Promise<Job> {
    const jobCategory: JobEnums.Categories =
      JobManager.getJobHandlerCategoryFromType(jobHandlerType);
    if (!jobCategory) {
      throw new Error(`No category found for job handler type: ${jobHandlerType}`);
    }

    const job: Job = new Job(jobHandlerType, jobCategory, jobData);

    await JobRepository.create(job);
    await this.publishJob(job);

    return job;
  },
  async publishJob(_job: Job) {
    // Logic to publish the job
  },
};

export default JobService;
