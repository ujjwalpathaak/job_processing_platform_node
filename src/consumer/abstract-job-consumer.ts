import { JobMessage } from "../dto/job-dtos";
import { JobCategories, JobStatuses } from "../enums/job-enums";
import { JobHandlerFactory } from "../factory/job-handler-factory";
import { update } from "../repositories/job-repository";
import { Logger } from "../services/log-service";

export abstract class AbstractJobConsumer {
  protected abstract consumerName: string;
  protected abstract category: JobCategories;

  protected async consumeInternal(message: JobMessage): Promise<void> {
    const handler = JobHandlerFactory.get(message.handler);
    if (message.category !== this.category) {
      throw new Error(
        `${this.consumerName} received wrong category. expected=${this.category} actual=${message.category}`,
      );
    }

    Logger.info(
      `${this.consumerName} - processing jobId=${message.id} with handler=${message.handler}`,
    );

    await update(message.id, JobStatuses.PROCESSING);
    try {
      await handler.process(message.data);
      await update(message.id, JobStatuses.PROCESSED);
      Logger.info(`${this.consumerName} - processed jobId=${message.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // const hasMoreRetries = me.attemptsMade + 1 <= handler.retries();
      await update(message.id, errorMessage);
      throw error;
    }
  }
}
