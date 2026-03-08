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

// export class JobRequest {
//   jobHandler: JobHandler;
//   data?: Record<string, unknown>;
//   timestamp: string;

//   constructor(jobHandler: Job.HandlerTypes, data: Record<string, unknown>) {
//     this.jobHandler = jobHandler;
//     this.data = data;
//     this.timestamp = new Date().toISOString();
//   }
// }
// export interface CreateJobRequest {
//   jobHandler: Job.HandlerTypes;
//   data?: Record<string, unknown>;
// }

export interface NewJob {}
