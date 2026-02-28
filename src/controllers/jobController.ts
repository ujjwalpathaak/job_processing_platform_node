import { Request, Response } from "express";
import * as jobService from "../services/jobService";
import { CreateJobRequest, UpdateJobRequest } from "../models/Job";
import * as ApiResponse from "../dto/ApiResponse";

export const getJobs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await jobService.getAllJobs();
    res.json(ApiResponse.success(jobs));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to fetch jobs"));
  }
};

export const getJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(Number(id));

    if (!job) {
      res.status(404).json(ApiResponse.failure("Job not found"));
      return;
    }

    res.json(ApiResponse.success(job));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to fetch job"));
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const body: CreateJobRequest = req.body;

    if (!body.name) {
      res.status(400).json(ApiResponse.failure("Job name is required"));
      return;
    }

    const job = await jobService.createJob(body);
    res.status(201).json(ApiResponse.success(job, "Job created successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to create job"));
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body: UpdateJobRequest = req.body;

    const job = await jobService.updateJob(Number(id), body);

    if (!job) {
      res.status(404).json(ApiResponse.failure("Job not found"));
      return;
    }

    res.json(ApiResponse.success(job, "Job updated successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to update job"));
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await jobService.deleteJob(Number(id));

    if (!deleted) {
      res.status(404).json(ApiResponse.failure("Job not found"));
      return;
    }

    res.json(ApiResponse.success(undefined, "Job deleted successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to delete job"));
  }
};
