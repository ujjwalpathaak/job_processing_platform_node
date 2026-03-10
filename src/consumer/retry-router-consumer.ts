import { JobMessage } from "../dto/job-dtos";
import { Queue } from "../enums/queue-enums";
import { Rabbit } from "../config/rabbit";

export class RetryRouterConsumer {
  protected routerName = "RetryRouterConsumer";

  constructor() {}

  public async start(): Promise<void> {
    const rabbit = await Rabbit.getInstance();
    const channel = rabbit.getChannel();

    channel.prefetch(10);

    await channel.consume(Queue.STANDARD, async (msg) => {
      if (!msg) return;

      try {
        const content: JobMessage = JSON.parse(msg.content.toString());
        console.log(
          `${this.routerName} - routing jobId=${content.id} to ${content.category} queue`,
        );
        channel.ack(msg);
      } catch (error) {
        console.error(`${this.routerName} error`, error);

        channel.nack(msg, false, false);
      }
    });
  }
}
