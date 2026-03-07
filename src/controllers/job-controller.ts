import { Request, Response } from "express";
import * as jobService from "../services/jobService";
import { CreateJobRequest } from "../interfaces/Job";
import ApiResponse from "../dto/api-response";
import { jobHandlerFactory } from "../factory/jobHandlerFactory";
import Utils from "../utils";

const JobController = {
  async createNewJob(req: Request, res: Response): Promise<Response> {
    try {
      const handler = req.params.handler;
      if (!handler) {
        return res.status(400).json(ApiResponse.failure("Handler parameter is required"));
      }

      const handlerType = Utils.getHandlerType(handler);
      if (!handlerType) {
        return res.status(400).json(ApiResponse.failure(`Invalid handler type: ${handler}`));
      }

      // continue from here

      const jobHandler = jobHandlerFactory.get(handler, handlerType);
      if (!jobHandler) {
        return res.status(400).json(ApiResponse.failure("Invalid handler specified"));
      }

      const body: CreateJobRequest = {
        jobHandler,
        data: req.body?.data,
      };

      const job = await jobService.createJob(body);

      return res.status(201).json(ApiResponse.success(job, "Job created successfully"));
    } catch {
      return res.status(500).json(ApiResponse.failure("Failed to create job"));
    }
  },
};

export default JobController;
