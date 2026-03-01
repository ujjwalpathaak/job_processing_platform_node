import { LogLevel } from "../enums/LogLevel";
import { v4 as uuidv4 } from "uuid";

export class LogMessage {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;

  constructor(message: string, level: LogLevel) {
    this.id = uuidv4();
    this.timestamp = new Date().toISOString();
    this.level = level;
    this.message = message;
  }
}
