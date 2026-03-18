import * as Log from "../enums/log-enums";

export class LogMessage {
  timestamp: string;
  level: Log.Level;
  message: string;

  constructor(message: string, level: Log.Level) {
    this.timestamp = new Date().toISOString();
    this.level = level;
    this.message = message;
  }
}
