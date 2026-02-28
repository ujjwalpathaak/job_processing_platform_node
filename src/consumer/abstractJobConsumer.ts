import { Job } from "bullmq";
import { JobMessage } from "../dto/JobMessage";
import { JobCategory, JobStatus } from "../enums";
import { JobHandlerFactory } from "../factory/jobHandlerFactory";
import * as jobService from "../services/jobService";

export abstract class AbstractJobConsumer {
  protected abstract consumerName: string;
  protected abstract category: JobCategory;

  protected constructor(private readonly jobHandlerFactory: JobHandlerFactory) {}

  protected async consumeInternal(job: Job<JobMessage>): Promise<void> {
    const payload = job.data;
    const handler = this.jobHandlerFactory.get(payload.jobHandler, payload.jobCategory);

    if (payload.jobCategory !== this.category) {
      throw new Error(
        `${this.consumerName} received wrong category. expected=${this.category} actual=${payload.jobCategory}`,
      );
    }

    console.log(`${this.consumerName} - processing jobId=${payload.jobId}`);

    await jobService.updateJobStatus(payload.jobId, JobStatus.PROCESSING);

    try {
      await handler.process(payload);
      await jobService.updateJobStatus(payload.jobId, JobStatus.PROCESSED);
      console.log(`${this.consumerName} - processed jobId=${payload.jobId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const hasMoreRetries = job.attemptsMade + 1 <= handler.retries();
      await jobService.updateJobStatus(
        payload.jobId,
        hasMoreRetries ? JobStatus.RETRY : JobStatus.ERROR,
        message,
      );
      throw error;
    }
  }
}
