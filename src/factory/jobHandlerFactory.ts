import { JobCategory, JobHandlerType } from "../enums";
import { JobHandler } from "../interfaces/JobHandler";
import { CrmSyncJobHandler } from "../handlers/job/crmSyncJobHandler";
import { EmailJobHandler } from "../handlers/job/emailJobHandler";
import { NotificationCleanupJobHandler } from "../handlers/job/notificationCleanupJobHandler";
import { RefundJobHandler } from "../handlers/job/refundJobHandler";
import { ReportGenerationJobHandler } from "../handlers/job/reportGenerationJobHandler";
import { WebhookTriggerJobHandler } from "../handlers/job/webhookTriggerJobHandler";

export class JobHandlerFactory {
  private readonly handlers: Map<JobHandlerType, JobHandler>;

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

  public get(handlerType: JobHandlerType, category: JobCategory): JobHandler {
    const handler = this.handlers.get(handlerType);

    if (!handler) {
      throw new Error(`No handler found for type=${handlerType}`);
    }

    if (handler.category() !== category) {
      throw new Error(
        `Handler category mismatch for type=${handlerType}. expected=${handler.category()} actual=${category}`,
      );
    }

    return handler;
  }
}

export const jobHandlerFactory = new JobHandlerFactory();
