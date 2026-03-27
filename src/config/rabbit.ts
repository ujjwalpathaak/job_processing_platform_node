import client, { Channel, ChannelModel } from "amqplib";
import { Queue, RETRY_QUEUE_DELAYS } from "../enums/queue-enums";
import { JobCategories } from "../enums/job-enums";
import { config } from "./config";
import { Logger } from "../services/log-service";

const QUEUE_BY_CATEGORY = {
  [JobCategories.STANDARD]: Queue.STANDARD,
  [JobCategories.CRITICAL]: Queue.CRITICAL,
  [JobCategories.EXTERNAL]: Queue.EXTERNAL,
};

export class Rabbit {
  private static instance: Rabbit | null = null;

  private connection!: ChannelModel;
  private publishChannel!: Channel;
  private readonly consumerChannels: Set<Channel> = new Set();
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
    Logger.info(`RabbitMQ connection initialization started | url=${config.rabbit.url}`);
    this.connection = await client.connect(config.rabbit.url);
    this.publishChannel = await this.connection.createChannel();
    Logger.info("RabbitMQ channel created successfully");

    for (const queue of this.queues) {
      const retryDelay = RETRY_QUEUE_DELAYS.find(({ queue: retryQueue }) => retryQueue === queue);

      if (retryDelay) {
        await this.publishChannel.assertQueue(queue, {
          durable: true,
          arguments: {
            "x-message-ttl": retryDelay.seconds * 1000,
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": Queue.RETRY_READY,
          },
        });
        Logger.info(
          `RabbitMQ queue asserted | queue=${queue} | durable=true | ttlMs=${retryDelay.seconds * 1000} | deadLetterQueue=${Queue.RETRY_READY}`,
        );
        continue;
      }

      await this.publishChannel.assertQueue(queue, { durable: true });
      Logger.info(`RabbitMQ queue asserted | queue=${queue} | durable=true`);
    }

    Logger.info("RabbitMQ connection is ready");
  }

  private async waitForDrain(channel: Channel): Promise<void> {
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        channel.off("drain", onDrain);
        resolve();
      }, config.rabbit.publishDrainTimeoutMs);

      const onDrain = () => {
        clearTimeout(timeout);
        channel.off("drain", onDrain);
        resolve();
      };

      channel.once("drain", onDrain);
    });
  }

  public async publish(queue: Queue, message: string): Promise<boolean> {
    try {
      const published = this.publishChannel.sendToQueue(queue, Buffer.from(message), {
        persistent: true,
      });
      if (!published) {
        Logger.info(`RabbitMQ publish backpressure encountered | queue=${queue}`);
        await this.waitForDrain(this.publishChannel);
      }

      return true;
    } catch (error) {
      Logger.error(`RabbitMQ publish failed with exception | queue=${queue} | error=${error}`);
      return false;
    }
  }

  public getQueueByCategory(category: JobCategories): Queue {
    return QUEUE_BY_CATEGORY[category];
  }

  public async createConsumerChannel(prefetch: number): Promise<Channel> {
    const channel = await this.connection.createChannel();
    await channel.prefetch(prefetch);
    this.consumerChannels.add(channel);
    return channel;
  }

  public async close(): Promise<void> {
    await Promise.all(
      Array.from(this.consumerChannels).map(async (channel) => {
        await channel.close();
      }),
    );

    this.consumerChannels.clear();
    await this.publishChannel.close();
    await this.connection.close();
  }
}
