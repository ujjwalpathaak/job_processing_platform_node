import * as Job from "../enums/job-enums";

export class JobStateHistory {
  id: string | undefined;
  jobId: number;
  status: Job.JobStatuses;
  createdAt: Date;
  errorMessage?: string;

  constructor(jobId: number, status: Job.JobStatuses, errorMessage?: string) {
    this.jobId = jobId;
    this.status = status;
    this.errorMessage = errorMessage;
    this.createdAt = new Date();
  }
}
