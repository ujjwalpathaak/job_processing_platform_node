import * as Job from "../enums/job-enums";

export interface JobMessage {
  jobId: number;
  jobCategory: Job.Categories;
  jobHandler: Job.HandlerTypes;
  data: Record<string, unknown>;
}
