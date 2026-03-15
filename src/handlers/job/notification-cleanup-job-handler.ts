import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
import { AbstractJobHandler } from "./abstract-job-handler";

export class NotificationCleanupJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerTypes {
    return JobHandlerTypes.NOTIFICATION_CLEANUP;
  }

  public category(): JobCategories {
    return JobCategories.STANDARD;
  }

  public retries(): number {
    return 0;
  }

  public backoff(): string[] {
    return [];
  }
  public process(data: jobData): Promise<void> {
    return super.process(data);
  }

  protected execute(data: jobData): void {
    if (!data) {
      throw new Error("Payload missing for cleanup job");
    }

    Logger.handlerInfo(`Cleanup completed for job ${data.id}`);
  }
}
