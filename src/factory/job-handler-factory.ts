import * as Job from "../enums/job-enums";
import { JobHandler } from "../interfaces/job-interfaces";
import { CrmSyncJobHandler } from "../handlers/job/crm-sync-job-handler";
import { EmailJobHandler } from "../handlers/job/email-job-handler";
import { NotificationCleanupJobHandler } from "../handlers/job/notification-cleanup-job-handler";
import { RefundJobHandler } from "../handlers/job/refund-job-handler";
import { ReportGenerationJobHandler } from "../handlers/job/report-generation-job-handler";
import { WebhookTriggerJobHandler } from "../handlers/job/webhook-trigger-job-handler";

export class JobHandlerFactory {
  private readonly handlers: Map<Job.HandlerTypes, JobHandler>;

  constructor() {
    const registeredHandlers: JobHandler[] = [
      new EmailJobHandler(),
      new ReportGenerationJobHandler(),
      new NotificationCleanupJobHandler(),
      new WebhookTriggerJobHandler(),
      new CrmSyncJobHandler(),
      new RefundJobHandler(),
    ];

    this.handlers = new Map(
      registeredHandlers.map((handler) => [handler.identify(), handler] as const),
    );
  }

  public get(handler: string, handlerType: Job.HandlerTypes): JobHandler {
    if (!handlerType) {
      throw new Error(`Invalid handler type: ${handler}`);
    }

    const handlerObj = this.handlers.get(handlerType);

    if (!handlerObj) {
      throw new Error(`No handler found for type=${handler}`);
    }

    return handlerObj;
  }
}

export const jobHandlerFactory = new JobHandlerFactory();
