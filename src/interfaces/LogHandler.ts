import { LogMessage } from "../dto/LogMessage";
import * as LogEnums from "../enums/Log";

export interface LogHandler {
  identify(): LogEnums.HandlerType;
  supportedLevels(): LogEnums.Level[];
  handle(message: LogMessage): void;
}
