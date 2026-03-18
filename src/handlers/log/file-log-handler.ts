import * as LogEnums from "../../enums/log-enums";
import { LogHandler } from "../../interfaces/log-handlers";
import { LogMessage } from "../../dto/log-dtos";
import fs from "fs";
import path from "path";

export default class FileLogHandler implements LogHandler {
  private static readonly JOB_LOG_FILE = path.join("logs", "job.log");
  private static readonly APPLICATION_LOG_FILE = path.join("logs", "application.log");
  private static readonly HANDLER_LOG_FILE = path.join("logs", "handler.log");

  identify(): LogEnums.HandlerType {
    return LogEnums.HandlerType.FILE;
  }

  supportedLevels(): LogEnums.Level[] {
    return [LogEnums.Level.INFO, LogEnums.Level.ERROR];
  }

  handle(message: LogMessage, fromHandler: boolean = false): void {
    try {
      const destinations = this.getDestinations(message, fromHandler);
      for (const destination of destinations) {
        this.writeToFile(destination.filePath, message, destination.stream);
      }
    } catch (error) {
      console.error("Failed to write log to file:", error);
    }
  }

  private writeToFile(
    filePath: string,
    message: LogMessage,
    stream: "JOB" | "APPLICATION" | "HANDLER",
  ): void {
    const logDir = path.dirname(filePath);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logLine = this.format(message, stream);
    fs.appendFileSync(filePath, logLine);
  }

  private getDestinations(
    message: LogMessage,
    fromHandler: boolean,
  ): Array<{ filePath: string; stream: "JOB" | "APPLICATION" | "HANDLER" }> {
    if (fromHandler) {
      return [{ filePath: FileLogHandler.HANDLER_LOG_FILE, stream: "HANDLER" }];
    }

    if (this.isJobLog(message.message)) {
      return [{ filePath: FileLogHandler.JOB_LOG_FILE, stream: "JOB" }];
    }

    return [{ filePath: FileLogHandler.APPLICATION_LOG_FILE, stream: "APPLICATION" }];
  }

  private isJobLog(message: string): boolean {
    const normalized = message.trim().toLowerCase();
    return (
      normalized.startsWith("job |") ||
      normalized.startsWith("rag |") ||
      normalized.includes("| jobid=")
    );
  }

  private format(message: LogMessage, stream: "JOB" | "APPLICATION" | "HANDLER"): string {
    return `${message.timestamp} | ${message.level} | ${stream} | ${message.id} | ${message.message}\n`;
  }
}
