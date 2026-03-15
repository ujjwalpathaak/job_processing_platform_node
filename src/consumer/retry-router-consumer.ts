import { JobMessage } from "../dto/job-dtos";
import { Queue } from "../enums/queue-enums";
import { Rabbit } from "../config/rabbit";
import { Logger } from "../services/log-service";

export class RetryRouterConsumer {
  protected routerName = "RetryRouterConsumer";

  constructor() {}

  public async start(): Promise<void> {
    const rabbit = await Rabbit.getInstance();
    const channel = rabbit.getChannel();

    channel.prefetch(10);

    await channel.consume(Queue.RETRY5SEC, async (msg) => {
      if (!msg) return;

      try {
        const content: JobMessage = JSON.parse(msg.content.toString());
        const targetQueue = rabbit.getQueueByCategory(content.category);
        rabbit.publish(targetQueue, JSON.stringify(content));
        Logger.info(`${this.routerName} - routed jobId=${content.id} to ${targetQueue} queue`);
        channel.ack(msg);
      } catch (error) {
        Logger.error(`${this.routerName} error: ${error}`);

        channel.nack(msg, false, false);
      }
    });
  }
}
