import { LogMessage } from "../dto/log-dtos";
import * as Log from "../enums/log-enums";
import { LogHandler } from "../interfaces/log-handlers";

const handlers: Map<Log.Level, LogHandler[]> = new Map();

export class Logger {
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

  private static handle(message: string, level: Log.Level, fromHandler: boolean = false): void {
    const list = handlers.get(level);
    if (!list || list.length === 0) return;

    const logMessage = new LogMessage(message, level);
    for (const handler of list) {
      handler.handle(logMessage, fromHandler);
    }
  }

  static handlerInfo(message: string): void {
    this.handle(message, Log.Level.INFO, true);
  }

  static handlerError(message: string): void {
    this.handle(message, Log.Level.ERROR, true);
  }

  static info(message: string): void {
    this.handle(message, Log.Level.INFO);
  }

  static error(message: string): void {
    this.handle(message, Log.Level.ERROR);
  }
}
