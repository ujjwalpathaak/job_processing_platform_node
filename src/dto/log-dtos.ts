import * as Log from "../enums/log-enums";

export class LogMessage {
  job_id?: string;
  handler?: string;
  timestamp: string;
  level: Log.Level;
  message: string;

  constructor(message: string, level: Log.Level, job_id?: string, handler?: string) {
    this.timestamp = new Date().toISOString();
    this.level = level;
    this.message = message;
    if (job_id) {
      this.job_id = job_id;
    }
    if (handler) {
      this.handler = handler;
    }
  }
}
