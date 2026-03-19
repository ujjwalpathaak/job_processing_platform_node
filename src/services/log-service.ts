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
    completion?: boolean,
  ): Promise<void> {
    if (!jobId || !handler) {
      return;
    }

    await publishLogForRag({
      job_id: jobId,
      handler,
      log_level: level,
      log_source: fromHandler ? "HANDLER" : "SYSTEM",
      message,
      timestamp: Date.now(),
    });

    if (completion) {
      await publishJobCompletedForRag({ job_id: jobId, handler });
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
    completion?: boolean,
  ): void {
    void this.forwardToRag(message, level, fromHandler, jobId, handler, completion);

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
    completion?: boolean,
  ): void {
    this.handle(message, Log.Level.INFO, true, jobId, handler, completion);
  }

  static handlerError(
    message: string,
    jobId?: string,
    handler?: string,
    completion?: boolean,
  ): void {
    this.handle(message, Log.Level.ERROR, true, jobId, handler, completion);
  }

  static info(message: string, jobId?: string, handler?: string, completion?: boolean): void {
    this.handle(message, Log.Level.INFO, false, jobId, handler, completion);
  }

  static error(message: string, jobId?: string, handler?: string, completion?: boolean): void {
    this.handle(message, Log.Level.ERROR, false, jobId, handler, completion);
  }
}
