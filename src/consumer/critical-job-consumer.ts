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
          `event=consumer.message.received consumer=${this.consumerName} queue=${Queue.CRITICAL} payload=${msg.content.toString()}`,
        );
        const content: JobMessage = JSON.parse(msg.content.toString());
        await this.consumeInternal(content);
        channel.ack(msg);
      } catch (error) {
        Logger.error(
          `event=consumer.message.failed consumer=${this.consumerName} queue=${Queue.CRITICAL} error=${error}`,
        );
        channel.nack(msg, false, false);
      }
    });
  }
}
