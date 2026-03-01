import { LogMessage } from "../dto/LogMessage";
import { LogLevel } from "../enums/LogLevel";
import { Template } from "../helpers/Template";
import { LogHandler } from "../interfaces/LogHandler";

const handlers: Map<LogLevel, LogHandler[]> = new Map();

export class LogService {
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

  private static handle(message: string, level: LogLevel): void {
    const list = handlers.get(level);
    if (!list || list.length === 0) return;

    const logMessage = new LogMessage(message, level);
    for (const handler of list) {
      handler.handle(logMessage);
    }
  }

  static info(template: string, ...args: unknown[]): void {
    this.handle(Template.format(template, ...args), LogLevel.INFO);
  }

  static debug(template: string, ...args: unknown[]): void {
    this.handle(Template.format(template, ...args), LogLevel.DEBUG);
  }

  static trace(template: string, ...args: unknown[]): void {
    this.handle(Template.format(template, ...args), LogLevel.TRACE);
  }

  static warn(template: string, ...args: unknown[]): void {
    this.handle(Template.format(template, ...args), LogLevel.WARN);
  }

  static error(template: string, ...args: unknown[]): void {
    this.handle(Template.format(template, ...args), LogLevel.ERROR);
  }
}
