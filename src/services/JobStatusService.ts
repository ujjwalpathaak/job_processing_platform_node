import { Job } from "../models/Job";
import { JobStateHistory } from "../models/JobStateHistory";
import { JobStatus } from "../enums/JobStatus";
import { jobStateHistoryRepository } from "../repositories/jobStateHistoryRepository";

export class JobStatusService {
  constructor(private readonly historyRepository = jobStateHistoryRepository) {}

  async updateJobStatus(job: Job, newStatus: JobStatus, errorMessage?: string): Promise<void> {
    if (!newStatus) {
      throw new Error("JobStatus cannot be null");
    }

    const updated = await this.historyRepository.updateJobStatus(job.id, newStatus);
    if (updated === 0) {
      throw new Error(`Job not found: ${job.id}`);
    }

    await this.historyRepository.save(new JobStateHistory(job.id, newStatus, errorMessage));
  }
}
