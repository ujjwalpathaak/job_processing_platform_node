import { JobMessage } from "../dto/JobMessage";
import * as Job from "../enums/Job";

export interface JobHandler {
  identify(): Job.HandlerTypes;
  category(): Job.Categories;
  retries(): number;
  backoff(): string[];
  process(message: JobMessage): Promise<void>;
}

// export interface JobHistory {
//   status: JobStatus;
//   timestamp: Date;
//   error?: string;
// }

export interface CreateJobRequest {
  jobHandler: JobHandler;
  data?: Record<string, unknown>;
}

export interface NewJob {}
