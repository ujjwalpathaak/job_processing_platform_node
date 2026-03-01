import { JobCategory } from "../enums/JobCategory";
import { JobHandlerType } from "../enums/JobHandlerType";
import { JobStatus } from "../enums/JobStatus";

export class Job {
  id: number;
  createdAt: Date;
  status: JobStatus;
  jobCategory: JobCategory;
  jobHandler: JobHandlerType;
  data: Record<string, unknown>;

  constructor(
    jobHandler: { category: () => JobCategory; identify: () => JobHandlerType },
    data: Record<string, unknown>,
  ) {
    this.status = JobStatus.SCHEDULED;
    this.jobCategory = jobHandler.category();
    this.jobHandler = jobHandler.identify();
    this.data = data;
    this.createdAt = new Date();
  }
}

export interface JobHistory {
  status: JobStatus;
  timestamp: Date;
  error?: string;
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
