import { LogMessage } from "../dto/log-message-dto";
import * as LogEnums from "../enums/log-enums";

export interface LogHandler {
  identify(): LogEnums.HandlerType;
  supportedLevels(): LogEnums.Level[];
  handle(message: LogMessage): void;
}
