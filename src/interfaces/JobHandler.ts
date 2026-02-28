import { JobMessage } from "../dto/JobMessage";
import { JobCategory, JobHandlerType } from "../enums";

export interface JobHandler {
  identify(): JobHandlerType;
  category(): JobCategory;
  retries(): number;
  backoff(): string[];
  process(message: JobMessage): Promise<void>;
}
