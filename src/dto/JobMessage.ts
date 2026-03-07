import * as Job from "../enums/Job";

export interface JobMessage {
  jobId: number;
  jobCategory: Job.Categories;
  jobHandler: Job.HandlerTypes;
  data: Record<string, unknown>;
}
