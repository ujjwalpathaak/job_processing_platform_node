import { EmailJobHandler } from "./email-job-handler";
import { JobHandlerTypes } from "../../enums/job-enums";
import { JobHandler } from "../../interfaces/job-interfaces";

export const jobHandlers: Partial<Record<JobHandlerTypes, JobHandler>> = {
  [JobHandlerTypes.EMAIL]: new EmailJobHandler(),
};
