import { Rabbit } from "../config/rabbit";
import { LogRagEventPayload } from "../dto/rag-dtos";
import { Queue } from "../enums/queue-enums";
import { Logger } from "../services/log-service";
import { finalizeJobLogsForRag, processLogForRag } from "../services/log-rag-worker-service";
import { config } from "../config/config";

export class LogRagConsumer {
  private consumerName = "LogRagConsumer";
  private rateWindowStartedAt = Date.now();
  private processedInCurrentWindow = 0;

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async waitForRateSlot(): Promise<void> {
    if (config.rag.consumerMaxPerSecond <= 0) {
      return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const now = Date.now();
      if (now - this.rateWindowStartedAt >= 1000) {
        this.rateWindowStartedAt = now;
        this.processedInCurrentWindow = 0;
      }

      if (this.processedInCurrentWindow < config.rag.consumerMaxPerSecond) {
        this.processedInCurrentWindow += 1;
        return;
      }

      const waitMs = Math.max(5, 1000 - (now - this.rateWindowStartedAt));
      await this.sleep(waitMs);
    }
  }

  public async start(): Promise<void> {
    const rabbit = await Rabbit.getInstance();
    const effectivePrefetch = Math.max(
      1,
      Math.min(config.rabbit.prefetch.logRag, config.rag.consumerMaxInFlight),
    );
    const channel = await rabbit.createConsumerChannel(effectivePrefetch);

    Logger.info(
      `RAG consumer started | prefetch=${effectivePrefetch} | maxInFlight=${config.rag.consumerMaxInFlight} | maxPerSecond=${config.rag.consumerMaxPerSecond}`,
    );

    await channel.consume(Queue.LOG_RAG, async (msg) => {
      if (!msg) return;

      try {
        await this.waitForRateSlot();

        const content: LogRagEventPayload = JSON.parse(msg.content.toString());

        if (content.type === "LOG") {
          await processLogForRag(content.payload);
        }

        if (content.type === "JOB_COMPLETED") {
          await finalizeJobLogsForRag(content.payload.job_id, content.payload.handler);
        }

        channel.ack(msg);
      } catch (error) {
        Logger.error(
          `RAG ingestion consumer failed to process message | consumer=${this.consumerName} | queue=${Queue.LOG_RAG} | error=${error}`,
        );
        channel.nack(msg, false, true);
      }
    });
  }
}
