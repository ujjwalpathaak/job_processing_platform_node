import { JobMessage } from "../dto/job-dtos";
import { JobCategories, JobStatuses } from "../enums/job-enums";
import { JobHandlerFactory } from "../factory/job-handler-factory";
import { updateHistory } from "../repositories/job-repository";
import { pushMessageToRetryQueue } from "../services/job-producer";
import { Logger } from "../services/log-service";

export abstract class AbstractJobConsumer {
  protected abstract consumerName: string;
  protected abstract category: JobCategories;

  protected async consumeInternal(message: JobMessage): Promise<void> {
    const handler = JobHandlerFactory.get(message.handler);
    const attempt = message.attempt ?? 0;
    if (message.category !== this.category) {
      throw new Error(
        `${this.consumerName} received wrong category. expected=${this.category} actual=${message.category}`,
      );
    }

    Logger.info(
      `${this.consumerName} - processing jobId=${message.id} with handler=${message.handler} attempt=${attempt + 1}`,
    );
    try {
      await updateHistory(message.id, JobStatuses.PROCESSING);
      try {
        await handler.process(message.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.handlerError(
          `${this.consumerName} - failed to process jobId=${message.id} on attempt=${attempt + 1} with error=${errorMessage}`,
        );

        const canRetry = attempt < handler.retries();
        if (canRetry) {
          await updateHistory(message.id, JobStatuses.RETRY, errorMessage);
          const requeued = await pushMessageToRetryQueue({
            ...message,
            attempt: attempt + 1,
          });

          if (!requeued) {
            await updateHistory(message.id, JobStatuses.ERROR, "Failed to push job to retry queue");
            await updateHistory(message.id, JobStatuses.DEAD, errorMessage);
            return;
          }

          Logger.info(
            `${this.consumerName} - queued retry for jobId=${message.id} nextAttempt=${attempt + 2}`,
          );
          return;
        }

        await updateHistory(message.id, JobStatuses.ERROR, errorMessage);
        await updateHistory(message.id, JobStatuses.DEAD, errorMessage);
        return;
      }
      await updateHistory(message.id, JobStatuses.PROCESSED);
      Logger.info(`${this.consumerName} - processed jobId=${message.id}`);
    } catch (error) {
      Logger.error(
        `${this.consumerName} - failed to process jobId=${message.id} with error=${error}`,
      );
    }
  }
}
