import { Request, Response } from "express";
import { createAndPublishJob } from "../services/job-service";
import ApiResponse from "../dto/api-response-dto";
import { HandlerTypes } from "../enums/job-enums";
import { jobData } from "../types/job-types";
import { isValidHandler } from "../managers/job-manager";

export const createNewJobController = async (req: Request, res: Response): Promise<Response> => {
  const handler: string = req.params.handler;
  const jobData: jobData = req.body.data || {};
  if (!handler) {
    return res.status(400).json(ApiResponse.failure("Handler parameter is required"));
  }

  const isValid: boolean = isValidHandler(handler);
  if (!isValid) {
    return res.status(400).json(ApiResponse.failure(`Invalid job handler type: ${handler}`));
  }
  try {
    const job = await createAndPublishJob(handler as HandlerTypes, jobData);
    return res.status(201).json(ApiResponse.success(job, "Job created successfully"));
  } catch {
    return res.status(500).json(ApiResponse.failure("Failed to create job"));
  }
};
