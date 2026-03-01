import { JobStatus } from "../enums/JobStatus";

export class JobStateHistory {
  id: number;
  jobId: number;
  status: JobStatus;
  createdAt: Date;
  errorMessage?: string;

  constructor(jobId: number, status: JobStatus, errorMessage?: string) {
    this.jobId = jobId;
    this.status = status;
    this.errorMessage = errorMessage;
    this.createdAt = new Date();
  }
}
