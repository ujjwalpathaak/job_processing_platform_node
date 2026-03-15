import { Rabbit } from "../config/rabbit";
import { Queue } from "../enums/queue-enums";
import { JobMessage } from "../dto/job-dtos";
import * as Job from "../enums/job-enums";
import { AbstractJobConsumer } from "./abstract-job-consumer";
import { Logger } from "../services/log-service";

export class CriticalJobConsumer extends AbstractJobConsumer {
  protected consumerName = "CriticalJobConsumer";
  protected category = Job.JobCategories.CRITICAL;

  constructor() {
    super();
  }

  public async start(): Promise<void> {
    const rabbit = await Rabbit.getInstance();
    const channel = rabbit.getChannel();

    channel.prefetch(10);

    await channel.consume(Queue.CRITICAL, async (msg) => {
      if (!msg) return;

      try {
        Logger.info(
          `${this.consumerName} - received message with content: ${msg.content.toString()}`,
        );
        const content: JobMessage = JSON.parse(msg.content.toString());
        await this.consumeInternal(content);
        channel.ack(msg);
      } catch (error) {
        Logger.error(`${this.consumerName} error: ${error}`);
        channel.nack(msg, false, false);
      }
    });
  }
}
