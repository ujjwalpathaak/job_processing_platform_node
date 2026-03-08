import { EmailJobHandler } from "./email-job-handler";
import * as JobEnums from "../../enums/job-enums";
import { JobHandler } from "../../interfaces/job-interfaces";

export const jobHandlers: Partial<Record<JobEnums.HandlerTypes, JobHandler>> = {
  [JobEnums.HandlerTypes.EMAIL]: new EmailJobHandler(),
};
