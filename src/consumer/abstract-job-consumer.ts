import { Job } from "bullmq";
import { JobMessage } from "../dto/job-dtos";
import { JobCategories } from "../enums/job-enums";
// import { JobHandlerFactoryClass } from "../factory/job-handler-factory";

export abstract class AbstractJobConsumer {
  protected abstract consumerName: string;
  protected abstract category: JobCategories;

  // protected constructor(private readonly jobHandlerFactory: JobHandlerFactoryClass) {}

  protected async consumeInternal(job: Job<JobMessage>): Promise<void> {
    const payload = job.data;
    // const handler = this.jobHandlerFactory.get(payload.jobHandler);

    if (payload.jobCategory !== this.category) {
      throw new Error(
        `${this.consumerName} received wrong category. expected=${this.category} actual=${payload.jobCategory}`,
      );
    }

    console.log(`${this.consumerName} - processing jobId=${payload.jobId}`);

    // await updateJobStatus(payload.jobId, JobStatuses.PROCESSING);

    // try {
    //   await handler.process(payload);
    //   // await updateJobStatus(payload.jobId, JobStatuses.PROCESSED);
    //   console.log(`${this.consumerName} - processed jobId=${payload.jobId}`);
    // } catch (error) {
    //   // const message = error instanceof Error ? error.message : "Unknown error";
    //   // const hasMoreRetries = job.attemptsMade + 1 <= handler.retries();
    //   // await updateJobStatus(
    //   //   payload.jobId,
    //   //   hasMoreRetries ? JobStatuses.RETRY : JobStatuses.ERROR,
    //   //   message,
    //   // );
    //   throw error;
    // }
  }
}
