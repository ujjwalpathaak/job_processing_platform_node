import * as Job from "../enums/Job";
import { JobHandler } from "../interfaces/Job";
import { CrmSyncJobHandler } from "../handlers/job/crmSyncJobHandler";
import { EmailJobHandler } from "../handlers/job/emailJobHandler";
import { NotificationCleanupJobHandler } from "../handlers/job/notificationCleanupJobHandler";
import { RefundJobHandler } from "../handlers/job/refundJobHandler";
import { ReportGenerationJobHandler } from "../handlers/job/reportGenerationJobHandler";
import { WebhookTriggerJobHandler } from "../handlers/job/webhookTriggerJobHandler";

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
