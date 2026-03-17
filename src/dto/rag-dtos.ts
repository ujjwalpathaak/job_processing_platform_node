export type LogRagLevel = "INFO" | "ERROR" | "WARN" | "DEBUG";
export type LogSource = "HANDLER" | "SYSTEM";
export type LogStream = "APPLICATION" | "ERROR" | "HANDLER_APPLICATION" | "HANDLER_ERROR";

export type LogIngestionPayload = {
  job_id: string;
  handler: string;
  log_level: LogRagLevel;
  log_source: LogSource;
  log_stream: LogStream;
  message: string;
  timestamp: number;
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
  handler?: string;
  log_level?: string;
  log_source?: string;
  log_stream?: string;
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
