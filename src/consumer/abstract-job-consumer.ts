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

    try {
      await updateHistory(message.id, JobStatuses.PROCESSING);
      try {
        Logger.info(
          "Job processing started | attempt=" + attempt,
          message.id,
          message.handler,
          undefined,
          true,
        );
        await handler.process(message.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.handlerError(
          `Handler execution failed; evaluating retry policy | attempt=${attempt} | error=${errorMessage}`,
          message.id,
          message.handler,
        );

        const canRetry = attempt <= handler.retries();
        if (canRetry) {
          const backoffValue = handler.backoff()[attempt] ?? handler.backoff().at(-1);
          await updateHistory(message.id, JobStatuses.RETRY, errorMessage);
          const requeued = await pushMessageToRetryQueue(
            {
              ...message,
              attempt: attempt + 1,
            },
            backoffValue,
          );

          if (!requeued) {
            await updateHistory(message.id, JobStatuses.ERROR, "Failed to push job to retry queue");
            await updateHistory(message.id, JobStatuses.DEAD, errorMessage);
            Logger.error(
              `Retry enqueue failed; marking job as dead | attempt=${attempt + 1} | error=${errorMessage}`,
              message.id,
              message.handler,
              undefined,
              true,
            );
            return;
          }

          Logger.info(
            `Retry scheduled for job processing | currentAttempt=${attempt + 1} | backoff=${backoffValue ?? "default"}`,
            message.id,
            message.handler,
            undefined,
            true,
          );
          return;
        }

        await updateHistory(message.id, JobStatuses.ERROR, errorMessage);
        await updateHistory(message.id, JobStatuses.DEAD, errorMessage);
        Logger.error(
          `Retries exhausted; marking job as dead | attempt=${attempt + 1} | maxRetries=${handler.retries()} | error=${errorMessage}`,
          message.id,
          message.handler,
          true,
          true,
        );
        return;
      }
      await updateHistory(message.id, JobStatuses.PROCESSED);
      Logger.info(
        `Job processing completed successfully | attempt=${attempt}`,
        message.id,
        message.handler,
        true,
        true,
      );
    } catch (error) {
      Logger.error(
        `Consumer pipeline failed with unhandled error | attempt=${attempt} | error=${error}`,
        message.id,
        message.handler,
        true,
        true,
      );
    }
  }
}
