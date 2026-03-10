import { JobMessage } from "../dto/job-dtos";
import { JobCategories } from "../enums/job-enums";
// import { JobHandlerFactoryClass } from "../factory/job-handler-factory";

export abstract class AbstractJobConsumer {
  protected abstract consumerName: string;
  protected abstract category: JobCategories;

  // protected constructor(private readonly jobHandlerFactory: JobHandlerFactoryClass) {}

  protected async consumeInternal(_content: JobMessage): Promise<void> {
    //     const data: JobMessage = JSON.parse(content);
    // console.log("Processing job:", data);
    // const payload = job.data;
    // const handler = this.jobHandlerFactory.get(payload.jobHandler);
    // if (payload.category !== this.category) {
    //   throw new Error(
    //     `${this.consumerName} received wrong category. expected=${this.category} actual=${payload.category}`,
    //   );
    // }
    // console.log(`${this.consumerName} - processing jobId=${payload.id}`);
    // await updateJobStatus(payload.id, JobStatuses.PROCESSING);
    // try {
    //   await handler.process(payload);
    //   // await updateJobStatus(payload.id, JobStatuses.PROCESSED);
    //   console.log(`${this.consumerName} - processed jobId=${payload.id}`);
    // } catch (error) {
    //   // const message = error instanceof Error ? error.message : "Unknown error";
    //   // const hasMoreRetries = job.attemptsMade + 1 <= handler.retries();
    //   // await updateJobStatus(
    //   //   payload.id,
    //   //   hasMoreRetries ? JobStatuses.RETRY : JobStatuses.ERROR,
    //   //   message,
    //   // );
    //   throw error;
    // }
  }
}
