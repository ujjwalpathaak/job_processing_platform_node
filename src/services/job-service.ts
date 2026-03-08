import JobRepository from "../repositories/job-repository";
import { Job } from "../models/job-model";
import { NewJob } from "../interfaces/job-interfaces";
import * as JobEnums from "../enums/job-enums";
import JobManager from "../managers/job-manager";
import { jobData } from "../types/job-types";

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
