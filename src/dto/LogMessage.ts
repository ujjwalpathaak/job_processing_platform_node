import * as Log from "../enums/Log";
import { v4 as uuidv4 } from "uuid";

export class LogMessage {
  id: string;
  timestamp: string;
  level: Log.Level;
  message: string;

  constructor(message: string, level: Log.Level) {
    this.id = uuidv4();
    this.timestamp = new Date().toISOString();
    this.level = level;
    this.message = message;
  }
}
