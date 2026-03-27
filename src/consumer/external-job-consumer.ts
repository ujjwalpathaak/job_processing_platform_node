import { Rabbit } from "../config/rabbit";
import { Queue } from "../enums/queue-enums";
import { JobMessage } from "../dto/job-dtos";
import * as Job from "../enums/job-enums";
import { AbstractJobConsumer } from "./abstract-job-consumer";
import { Logger } from "../services/log-service";
import { config } from "../config/config";

export class ExternalJobConsumer extends AbstractJobConsumer {
  protected consumerName = "ExternalJobConsumer";
  protected category = Job.JobCategories.EXTERNAL;

  constructor() {
    super();
  }

  public async start(): Promise<void> {
    const rabbit = await Rabbit.getInstance();
    const channel = await rabbit.createConsumerChannel(config.rabbit.prefetch.external);

    await channel.consume(Queue.EXTERNAL, async (msg) => {
      if (!msg) return;
      let content: JobMessage | undefined;

      try {
        const parsedContent: JobMessage = JSON.parse(msg.content.toString());
        content = parsedContent;
        Logger.info(
          `Message received | consumer=${this.consumerName}`,
          parsedContent.id,
          parsedContent.handler,
          undefined,
          true,
        );
        await this.consumeInternal(parsedContent);
        channel.ack(msg);
      } catch (error) {
        Logger.error(
          `Queue message processing failed | consumer=${this.consumerName} | error=${error}`,
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
