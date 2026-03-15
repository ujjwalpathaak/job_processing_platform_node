import { EmailJobHandler } from "./email-job-handler";
import { JobHandlerTypes } from "../../enums/job-enums";
import { JobHandler } from "../../interfaces/job-interfaces";
import { CrmSyncJobHandler } from "./crm-sync-job-handler";

export const jobHandlers: Partial<Record<JobHandlerTypes, JobHandler>> = {
  [JobHandlerTypes.EMAIL]: new EmailJobHandler(),
  [JobHandlerTypes.CRM_SYNC]: new CrmSyncJobHandler(),
};
