import { LogMessage } from "../dto/LogMessage";
import * as Log from "../enums/Log";
import { LogHandler } from "../interfaces/LogHandler";

const handlers: Map<Log.Level, LogHandler[]> = new Map();

export class Logger {
  static init(handlerList: LogHandler[]): void {
    for (const handler of handlerList) {
      for (const level of handler.supportedLevels()) {
        if (!handlers.has(level)) {
          handlers.set(level, []);
        }
        handlers.get(level)!.push(handler);
      }
    }
  }

  private static handle(message: string, level: Log.Level): void {
    const list = handlers.get(level);
    if (!list || list.length === 0) return;

    const logMessage = new LogMessage(message, level);
    for (const handler of list) {
      handler.handle(logMessage);
    }
  }

  static info(message: string): void {
    this.handle(message, Log.Level.INFO);
  }

  static debug(message: string): void {
    this.handle(message, Log.Level.DEBUG);
  }

  static trace(message: string): void {
    this.handle(message, Log.Level.TRACE);
  }

  static warn(message: string): void {
    this.handle(message, Log.Level.WARN);
  }

  static error(message: string): void {
    this.handle(message, Log.Level.ERROR);
  }
}
