import { JobMessage } from "../dto/job-dtos";
import { JobCategories, JobStatuses } from "../enums/job-enums";
import { resolveRetryQueue } from "../enums/queue-enums";
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
      `processing started | consumer=${this.consumerName} | attempt=${attempt + 1}`,
      message.id,
      message.handler,
    );
    try {
      await updateHistory(message.id, JobStatuses.PROCESSING);
      try {
        await handler.process(message.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.handlerError(
          `processing failed | consumer=${this.consumerName} | attempt=${attempt + 1} | error=${errorMessage}`,
          message.id,
          message.handler,
        );

        const canRetry = attempt < handler.retries();
        if (canRetry) {
          const backoffValue = handler.backoff()[attempt] ?? handler.backoff().at(-1);
          const retryQueue = resolveRetryQueue(backoffValue);
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
              `retry enqueue failed | consumer=${this.consumerName} | attempt=${attempt + 1} | error=${errorMessage}`,
              message.id,
              message.handler,
            );
            return;
          }

          Logger.info(
            `retry queued | consumer=${this.consumerName} | currentAttempt=${attempt + 1} | nextAttempt=${attempt + 2} | backoff=${backoffValue ?? "default"} | queue=${retryQueue}`,
            message.id,
            message.handler,
          );
          return;
        }

        await updateHistory(message.id, JobStatuses.ERROR, errorMessage);
        await updateHistory(message.id, JobStatuses.DEAD, errorMessage);
        Logger.error(
          `retry exhausted | consumer=${this.consumerName} | attempt=${attempt + 1} | maxRetries=${handler.retries()} | error=${errorMessage}`,
          message.id,
          message.handler,
          true,
        );
        return;
      }
      await updateHistory(message.id, JobStatuses.PROCESSED);
      Logger.info(
        `processing completed | consumer=${this.consumerName} | attempt=${attempt + 1}`,
        message.id,
        message.handler,
        true,
      );
    } catch (error) {
      Logger.error(
        `processing unhandled error | consumer=${this.consumerName} | attempt=${attempt + 1} | error=${error}`,
        message.id,
        message.handler,
        true,
      );
    }
  }
}
