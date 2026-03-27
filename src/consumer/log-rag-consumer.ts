import { Rabbit } from "../config/rabbit";
import { LogRagEventPayload } from "../dto/rag-dtos";
import { Queue } from "../enums/queue-enums";
import { Logger } from "../services/log-service";
import { finalizeJobLogsForRag, processLogForRag } from "../services/log-rag-worker-service";
import { config } from "../config/config";

export class LogRagConsumer {
  private consumerName = "LogRagConsumer";

  public async start(): Promise<void> {
    const rabbit = await Rabbit.getInstance();
    const channel = await rabbit.createConsumerChannel(config.rabbit.prefetch.logRag);

    await channel.consume(Queue.LOG_RAG, async (msg) => {
      if (!msg) return;

      try {
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
