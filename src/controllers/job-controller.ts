import { Request, Response } from "express";
import JobService from "../services/job-service";
import ApiResponse from "../dto/api-response";
import * as JobEnums from "../enums/Job";
import { jobData } from "../types/job";
import JobManager from "../managers/job-manager";

const JobController = {
  async createNewJob(req: Request, res: Response): Promise<Response> {
    const handler: string = req.params.handler;
    const jobData: jobData = req.body.data || {};
    if (!handler) {
      return res.status(400).json(ApiResponse.failure("Handler parameter is required"));
    }

    const jobHandlerType: JobEnums.HandlerTypes | undefined = JobManager.getJobHandlerType(handler);
    if (!jobHandlerType) {
      return res.status(400).json(ApiResponse.failure(`Invalid job handler type: ${handler}`));
    }
    try {
      const job = await JobService.createJob(jobHandlerType, jobData);
      return res.status(201).json(ApiResponse.success(job, "Job created successfully"));
    } catch {
      return res.status(500).json(ApiResponse.failure("Failed to create job"));
    }
  },
};

export default JobController;
