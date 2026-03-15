import * as LogEnums from "../../enums/log-enums";
import { LogHandler } from "../../interfaces/log-handlers";
import { LogMessage } from "../../dto/log-dtos";
import fs from "fs";
import path from "path";

export default class FileLogHandler implements LogHandler {
  private static readonly ERROR_LOG_FILE = path.join("logs", "error.log");
  private static readonly LOG_FILE = path.join("logs", "application.log");
  private static readonly HANDLER_LOG_FILE = path.join("logs", "handler.application.log");
  private static readonly HANDLER_ERROR_LOG_FILE = path.join("logs", "handler.error.log");

  identify(): LogEnums.HandlerType {
    return LogEnums.HandlerType.FILE;
  }

  supportedLevels(): LogEnums.Level[] {
    return [LogEnums.Level.INFO, LogEnums.Level.ERROR];
  }

  handle(message: LogMessage, fromHandler: boolean = false): void {
    try {
      const filePaths = this.getFilePath(message.level, fromHandler);
      for (const filePath of filePaths) {
        this.writeToFile(filePath, message);
      }
    } catch (error) {
      console.error("Failed to write log to file:", error);
    }
  }

  private writeToFile(filePath: string, message: LogMessage): void {
    const logDir = path.dirname(filePath);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logLine = this.format(message);
    fs.appendFileSync(filePath, logLine);
  }

  private getFilePath(level: LogEnums.Level, fromHandler: boolean = false): string[] {
    switch (level) {
      case LogEnums.Level.ERROR:
        switch (fromHandler) {
          case true:
            return [FileLogHandler.HANDLER_LOG_FILE, FileLogHandler.HANDLER_ERROR_LOG_FILE];
          case false:
            return [FileLogHandler.ERROR_LOG_FILE, FileLogHandler.LOG_FILE];
        }
        break;

      case LogEnums.Level.INFO:
        switch (fromHandler) {
          case true:
            return [FileLogHandler.HANDLER_LOG_FILE];
          case false:
            return [FileLogHandler.LOG_FILE];
        }
        break;

      default:
        throw new Error(`Unsupported log level: ${level}`);
    }
  }

  private format(message: LogMessage): string {
    return `[${message.id}] [${message.timestamp}] [${message.level}] ${message.message}\n`;
  }
}
