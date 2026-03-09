import { LogMessage } from "../dto/log-dtos";
import * as LogEnums from "../enums/log-enums";

export interface LogHandler {
  identify(): LogEnums.HandlerType;
  supportedLevels(): LogEnums.Level[];
  handle(message: LogMessage): void;
}
