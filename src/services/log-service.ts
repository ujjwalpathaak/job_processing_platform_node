import { LogMessage } from "../dto/log-dtos";
import * as Log from "../enums/log-enums";
import { LogHandler } from "../interfaces/log-handlers";
import { publishJobCompletedForRag, publishLogForRag } from "./log-rag-producer";

const handlers: Map<Log.Level, LogHandler[]> = new Map();

export class Logger {
  private static async forwardToRag(
    message: string,
    level: Log.Level,
    fromHandler: boolean,
    jobId?: string,
    handler?: string,
    emitCompletion?: boolean,
  ): Promise<void> {
    if (!jobId || !handler) {
      return;
    }

    const ragLevel = level === Log.Level.ERROR ? "ERROR" : "INFO";
    const logSource = fromHandler ? "HANDLER" : "SYSTEM";
    const logStream = fromHandler
      ? ragLevel === "ERROR"
        ? "HANDLER_ERROR"
        : "HANDLER_APPLICATION"
      : ragLevel === "ERROR"
        ? "ERROR"
        : "APPLICATION";

    await publishLogForRag({
      job_id: jobId,
      handler,
      log_level: ragLevel,
      log_source: logSource,
      log_stream: logStream,
      message,
      timestamp: Date.now(),
    });

    if (emitCompletion) {
      await publishJobCompletedForRag(jobId, handler);
    }
  }

  static init(handlerList: LogHandler[]): void {
    handlers.clear();

    for (const handler of handlerList) {
      for (const level of handler.supportedLevels()) {
        const levelHandlers = handlers.get(level) ?? [];
        levelHandlers.push(handler);
        handlers.set(level, levelHandlers);
      }
    }
  }

  private static handle(
    message: string,
    level: Log.Level,
    fromHandler: boolean = false,
    jobId?: string,
    handler?: string,
    emitCompletion?: boolean,
  ): void {
    void this.forwardToRag(message, level, fromHandler, jobId, handler, emitCompletion);

    const list = handlers.get(level);
    if (!list || list.length === 0) return;

    const logMessage = new LogMessage(message, level);
    for (const handler of list) {
      handler.handle(logMessage, fromHandler);
    }
  }

  static handlerInfo(
    message: string,
    jobId?: string,
    handler?: string,
    emitCompletion?: boolean,
  ): void {
    this.handle(message, Log.Level.INFO, true, jobId, handler, emitCompletion);
  }

  static handlerError(
    message: string,
    jobId?: string,
    handler?: string,
    emitCompletion?: boolean,
  ): void {
    this.handle(message, Log.Level.ERROR, true, jobId, handler, emitCompletion);
  }

  static info(message: string, jobId?: string, handler?: string, emitCompletion?: boolean): void {
    this.handle(message, Log.Level.INFO, false, jobId, handler, emitCompletion);
  }

  static error(message: string, jobId?: string, handler?: string, emitCompletion?: boolean): void {
    this.handle(message, Log.Level.ERROR, false, jobId, handler, emitCompletion);
  }
}
