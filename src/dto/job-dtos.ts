import { JobCategories, JobHandlerTypes } from "../enums/job-enums";

export interface JobMessage {
  id: string;
  category: JobCategories;
  handler: JobHandlerTypes;
  data: Record<string, unknown>;
  attempt?: number;
}
