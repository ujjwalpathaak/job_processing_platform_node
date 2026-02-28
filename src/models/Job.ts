import { JobStatus, JobCategory, JobHandlerType } from "../enums";

export interface JobHistory {
  status: JobStatus;
  timestamp: Date;
  error?: string;
}

export interface Job {
  id: number;
  jobHandler: JobHandlerType;
  jobCategory: JobCategory;
  status: JobStatus;
  data?: Record<string, unknown>;
  history?: JobHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobRequest {
  jobHandler: JobHandlerType;
  jobCategory: JobCategory;
  data?: Record<string, unknown>;
}

export interface UpdateJobRequest {
  status?: JobStatus;
  data?: Record<string, unknown>;
}
