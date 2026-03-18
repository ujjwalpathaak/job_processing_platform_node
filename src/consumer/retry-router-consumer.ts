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

      try {
        const content: JobMessage = JSON.parse(msg.content.toString());
        Logger.info(
          `retry ready received | consumer=${this.routerName} | jobId=${content.id} | category=${content.category} | attempt=${(content.attempt ?? 0) + 1}`,
        );
        const targetQueue = rabbit.getQueueByCategory(content.category);
        const published = rabbit.publish(targetQueue, JSON.stringify(content));
        if (!published) {
          await updateHistory(
            content.id,
            JobStatuses.ERROR,
            "Failed to republish job from retry queue",
          );
          await updateHistory(content.id, JobStatuses.DEAD, "Retry republish failed");
          throw new Error(`Failed to publish retried job ${content.id} to ${targetQueue}`);
        }

        await updateHistory(content.id, JobStatuses.PUBLISHED);
        Logger.info(
          `retry republished | consumer=${this.routerName} | jobId=${content.id} | targetQueue=${targetQueue} | category=${content.category} | attempt=${(content.attempt ?? 0) + 1}`,
        );
        channel.ack(msg);
      } catch (error) {
        Logger.error(`retry republish failed | consumer=${this.routerName} | error=${error}`);

        channel.nack(msg, false, false);
      }
    });
  }
}
