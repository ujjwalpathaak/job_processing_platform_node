import { Categories, HandlerTypes } from "../enums/job-enums";

export interface JobMessage {
  jobId: number;
  jobCategory: Categories;
  jobHandler: HandlerTypes;
  data: Record<string, unknown>;
}
