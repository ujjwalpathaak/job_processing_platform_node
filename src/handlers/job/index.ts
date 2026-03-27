import { CrmSyncJobHandler } from "./crm-sync-job-handler";
import { EmailJobHandler } from "./email-job-handler";
import { JobHandlerTypes } from "../../enums/job-enums";
import { JobHandler } from "../../interfaces/job-interfaces";
import { PaymentJobHandler } from "./payment-job-handler";
import { RefundJobHandler } from "./refund-job-handler";
import { ReportGenerationJobHandler } from "./report-generation-job-handler";
import { WebhookTriggerJobHandler } from "./webhook-trigger-job-handler";

export const jobHandlers: Partial<Record<JobHandlerTypes, JobHandler>> = {
  [JobHandlerTypes.EMAIL]: new EmailJobHandler(),
  [JobHandlerTypes.REPORT_GENERATION]: new ReportGenerationJobHandler(),
  [JobHandlerTypes.WEBHOOK_TRIGGER]: new WebhookTriggerJobHandler(),
  [JobHandlerTypes.CRM_SYNC]: new CrmSyncJobHandler(),
  [JobHandlerTypes.PAYMENT]: new PaymentJobHandler(),
  [JobHandlerTypes.REFUND]: new RefundJobHandler(),
};
