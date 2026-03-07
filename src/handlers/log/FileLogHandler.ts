import * as LogEnums from "../../enums/Log";
import { LogHandler } from "../../interfaces/LogHandler";
import { LogMessage } from "../../dto/LogMessage";
import fs from "fs";
import path from "path";

export class FileLogHandler implements LogHandler {
  private static readonly ERROR_LOG_FILE = path.join("logs", "error.log");
  private static readonly LOG_FILE = path.join("logs", "application.log");

  identify(): LogEnums.HandlerType {
    return LogEnums.HandlerType.FILE;
  }

  supportedLevels(): LogEnums.Level[] {
    return [LogEnums.Level.TRACE, LogEnums.Level.INFO, LogEnums.Level.ERROR];
  }

  handle(message: LogMessage): void {
    try {
      const filePath = this.getFilePath(message.level);
      const logDir = path.dirname(filePath);

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logLine = this.format(message);
      fs.appendFileSync(filePath, logLine);
    } catch (error) {
      console.error("Failed to write log to file:", error);
    }
  }

  private getFilePath(level: LogEnums.Level): string {
    switch (level) {
      case LogEnums.Level.ERROR:
        return FileLogHandler.ERROR_LOG_FILE;
      case LogEnums.Level.DEBUG:
      case LogEnums.Level.TRACE:
      case LogEnums.Level.INFO:
      case LogEnums.Level.WARN:
        return FileLogHandler.LOG_FILE;
      default:
        throw new Error(`Unsupported log level: ${level}`);
    }
  }

  private format(message: LogMessage): string {
    return `[${message.id}] [${message.timestamp}] [${message.level}] ${message.message}\n`;
  }
}
