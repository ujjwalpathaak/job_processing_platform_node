import client, { Channel, ChannelModel } from "amqplib";
import { Queue, RETRY_QUEUE_DELAYS } from "../enums/queue-enums";
import { JobCategories } from "../enums/job-enums";
import { Logger } from "../services/log-service";

const QUEUE_BY_CATEGORY = {
  [JobCategories.STANDARD]: Queue.STANDARD,
  [JobCategories.CRITICAL]: Queue.CRITICAL,
  [JobCategories.EXTERNAL]: Queue.EXTERNAL,
};

export class Rabbit {
  private static instance: Rabbit | null = null;

  private connection!: ChannelModel;
  private channel!: Channel;
  private readonly queues: Queue[] = Object.values(Queue);

  private constructor() {}

  public static async getInstance(): Promise<Rabbit> {
    if (!Rabbit.instance) {
      const rabbit = new Rabbit();
      await rabbit.initialize();
      Rabbit.instance = rabbit;
    }

    return Rabbit.instance;
  }

  private async initialize(): Promise<void> {
    Logger.info("app | rabbit connection | initializing | url=amqp://localhost");
    this.connection = await client.connect("amqp://localhost");
    this.channel = await this.connection.createChannel();
    Logger.info("app | rabbit channel | created");

    for (const queue of this.queues) {
      const retryDelay = RETRY_QUEUE_DELAYS.find(({ queue: retryQueue }) => retryQueue === queue);

      if (retryDelay) {
        await this.channel.assertQueue(queue, {
          durable: true,
          arguments: {
            "x-message-ttl": retryDelay.seconds * 1000,
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": Queue.RETRY_READY,
          },
        });
        Logger.info(
          `app | rabbit queue asserted | queue=${queue} | durable=true | ttlMs=${retryDelay.seconds * 1000} | deadLetterQueue=${Queue.RETRY_READY}`,
        );
        continue;
      }

      await this.channel.assertQueue(queue, { durable: true });
      Logger.info(`app | rabbit queue asserted | queue=${queue} | durable=true`);
    }

    Logger.info("app | rabbit connection | ready");
  }

  public publish(queue: Queue, message: string): boolean {
    try {
      const published = this.channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      if (!published) {
        Logger.error(`app | rabbit publish | backpressure | queue=${queue}`);
      }
      return published;
    } catch (error) {
      Logger.error(`app | rabbit publish | exception | queue=${queue} | error=${error}`);
      return false;
    }
  }

  public getQueueByCategory(category: JobCategories): Queue {
    return QUEUE_BY_CATEGORY[category];
  }

  public getChannel(): Channel {
    return this.channel;
  }

  public async close(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}
