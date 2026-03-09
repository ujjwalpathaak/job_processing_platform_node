import { JobCategories, JobHandlerTypes } from "../enums/job-enums";

export interface JobMessage {
  id: number;
  category: JobCategories;
  handler: JobHandlerTypes;
  data: Record<string, unknown>;
}
