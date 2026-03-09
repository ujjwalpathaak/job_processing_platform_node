import { JobCategories, JobHandlerTypes } from "../enums/job-enums";

export interface JobMessage {
  jobId: number;
  jobCategory: JobCategories;
  jobHandler: JobHandlerTypes;
  data: Record<string, unknown>;
}
