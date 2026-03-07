import { Request, Response } from "express";
import * as jobService from "../services/jobService";
import { CreateJobRequest } from "../interfaces/Job";
import * as ApiResponse from "../dto/ApiResponse";
import { jobHandlerFactory } from "../factory/jobHandlerFactory";
import { toJobHandlerType } from "../enums";
// import { bull } from "../services/jobProducer";

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const handler = req.params.handler as string;

    const handlerType = toJobHandlerType(handler);

    if (!handlerType) {
      throw new Error(`Invalid handler type: ${handler}`);
    }

    const body: CreateJobRequest = {
      jobHandler: jobHandlerFactory.get(handler, handlerType),
      data: req?.body?.data,
    };

    if (body.jobHandler === undefined) {
      res.status(400).json(ApiResponse.failure("Invalid handler specified"));
      return;
    }

    const job = await jobService.createJob(body);
    // await bull.addJob(job);
    res.status(201).json(ApiResponse.success(job, "Job created successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to create job"));
  }
};
