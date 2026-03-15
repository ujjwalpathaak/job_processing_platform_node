import client, { Channel, ChannelModel } from "amqplib";
import { Queue } from "../enums/queue-enums";
import { JobCategories } from "../enums/job-enums";

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
    this.connection = await client.connect("amqp://localhost");
    this.channel = await this.connection.createChannel();

    for (const queue of this.queues) {
      await this.channel.assertQueue(queue, { durable: true });
    }
  }

  public publish(queue: Queue, message: string): boolean {
    try {
      return this.channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    } catch (error) {
      console.error(`RabbitMQ publish error (${queue})`, error);
      return false;
    }
  }

  public getQueueByCategory(category: JobCategories): Queue {
    switch (category) {
      case JobCategories.STANDARD:
        return Queue.STANDARD;
      case JobCategories.CRITICAL:
        return Queue.CRITICAL;
      case JobCategories.EXTERNAL:
        return Queue.EXTERNAL;
    }
  }

  public getChannel(): Channel {
    return this.channel;
  }

  public async close(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}
