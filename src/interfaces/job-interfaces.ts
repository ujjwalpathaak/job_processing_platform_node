import * as Job from "../enums/job-enums";
import { jobData } from "../types/job-types";

export interface JobHandler {
  identify(): Job.JobHandlerTypes;
  category(): Job.JobCategories;
  retries(): number;
  backoff(): string[];
  process(data: jobData): Promise<void>;
}
