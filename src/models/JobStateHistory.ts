import * as Job from "../enums/Job";

export class JobStateHistory {
  id: number | undefined;
  jobId: number;
  status: Job.Statuses;
  createdAt: Date;
  errorMessage?: string;

  constructor(jobId: number, status: Job.Statuses, errorMessage?: string) {
    this.jobId = jobId;
    this.status = status;
    this.errorMessage = errorMessage;
    this.createdAt = new Date();
  }
}
