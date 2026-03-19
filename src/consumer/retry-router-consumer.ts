import { JobMessage } from "../dto/job-dtos";
import { JobStatuses } from "../enums/job-enums";
import { Queue } from "../enums/queue-enums";
import { Rabbit } from "../config/rabbit";
import { updateHistory } from "../repositories/job-repository";
import { Logger } from "../services/log-service";

export class RetryRouterConsumer {
  protected routerName = "RetryRouterConsumer";

  constructor() {}

  public async start(): Promise<void> {
    const rabbit = await Rabbit.getInstance();
    const channel = rabbit.getChannel();

    channel.prefetch(10);

    await channel.consume(Queue.RETRY_READY, async (msg) => {
      if (!msg) return;
      let content: JobMessage | undefined;

      try {
        const parsedContent: JobMessage = JSON.parse(msg.content.toString());
        content = parsedContent;
        Logger.info(
          `Message received | consumer=${this.routerName}`,
          parsedContent.id,
          parsedContent.handler,
          undefined,
          true,
        );
        const targetQueue = rabbit.getQueueByCategory(parsedContent.category);
        const published = rabbit.publish(targetQueue, JSON.stringify(parsedContent));
        if (!published) {
          await updateHistory(
            parsedContent.id,
            JobStatuses.ERROR,
            "Failed to republish job from retry queue",
          );
          await updateHistory(parsedContent.id, JobStatuses.DEAD, "Retry republish failed");
          throw new Error(`Failed to publish retried job ${parsedContent.id} to ${targetQueue}`);
        }

        Logger.info(
          `Message republished | targetQueue=${targetQueue}`,
          parsedContent.id,
          parsedContent.handler,
          undefined,
          true,
        );
        await updateHistory(parsedContent.id, JobStatuses.PUBLISHED);
        channel.ack(msg);
      } catch (error) {
        Logger.error(
          `Queue message processing failed | consumer=${this.routerName} | error=${error}`,
          content?.id,
          content?.handler,
          undefined,
          true,
        );

        channel.nack(msg, false, false);
      }
    });
  }
}
