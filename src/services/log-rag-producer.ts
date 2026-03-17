import { Rabbit } from "../config/rabbit";
import { LogIngestionPayload, LogRagEventPayload } from "../dto/rag-dtos";
import { Queue } from "../enums/queue-enums";

export const publishLogForRag = async (payload: LogIngestionPayload): Promise<boolean> => {
  const rabbit = await Rabbit.getInstance();
  const message: LogRagEventPayload = {
    type: "LOG",
    payload,
  };

  return rabbit.publish(Queue.LOG_RAG, JSON.stringify(message));
};

export const publishJobCompletedForRag = async (
  jobId: string,
  handler?: string,
): Promise<boolean> => {
  const rabbit = await Rabbit.getInstance();
  const message: LogRagEventPayload = {
    type: "JOB_COMPLETED",
    payload: {
      job_id: jobId,
      event: "JOB_COMPLETED",
      handler,
      timestamp: Date.now(),
    },
  };

  return rabbit.publish(Queue.LOG_RAG, JSON.stringify(message));
};
