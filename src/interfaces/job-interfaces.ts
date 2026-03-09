import { JobMessage } from "../dto/job-dtos";
import * as Job from "../enums/job-enums";

export interface JobHandler {
  identify(): Job.JobHandlerTypes;
  category(): Job.JobCategories;
  retries(): number;
  backoff(): string[];
  process(message: JobMessage): Promise<void>;
}
