import { JobMessage } from "../dto/job-message-dto";
import * as Job from "../enums/job-enums";

export interface JobHandler {
  identify(): Job.HandlerTypes;
  category(): Job.Categories;
  retries(): number;
  backoff(): string[];
  process(message: JobMessage): Promise<void>;
}

export interface NewJob {}
