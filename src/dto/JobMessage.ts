import { JobCategory, JobHandlerType } from "../enums";

export interface JobMessage {
  jobId: number;
  jobCategory: JobCategory;
  jobHandler: JobHandlerType;
  data: Record<string, unknown>;
}
