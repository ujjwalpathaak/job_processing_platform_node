import * as Log from "../enums/log-enums";

export type LogSource = "HANDLER" | "SYSTEM";

export type LogIngestionPayload = {
  job_id: string;
  handler: string;
  log_level: Log.Level;
  log_source: LogSource;
  message: string;
  timestamp: number;
};

export type CompleteLogIngestionPayload = {
  job_id: string;
  handler: string;
};

export type JobCompletedPayload = {
  job_id: string;
  handler?: string;
};

export type LogRagEventPayload =
  | {
      type: "LOG";
      payload: LogIngestionPayload;
    }
  | {
      type: "JOB_COMPLETED";
      payload: JobCompletedPayload;
    };

export type RAGFilters = {
  job_id?: string;
  handler?: string;
};

export type RAGQueryRequest = {
  query: string;
  topK?: number;
};

export type RetrievedChunk = {
  id: number;
  job_id: string;
  handler: string;
  log_level: string;
  log_source: string;
  log_stream: string;
  content: string;
  created_at: string;
  similarity: number;
};
