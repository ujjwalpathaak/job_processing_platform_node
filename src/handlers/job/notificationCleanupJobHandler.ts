import { JobMessage } from "../../dto/JobMessage";
import { JobCategory, JobHandlerType } from "../../enums";
import { AbstractJobHandler } from "./abstractJobHandler";

export class NotificationCleanupJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerType {
    return JobHandlerType.NOTIFICATION_CLEANUP;
  }

  public category(): JobCategory {
    return JobCategory.STANDARD;
  }

  public retries(): number {
    return 0;
  }

  public backoff(): string[] {
    return [];
  }

  protected execute(message: JobMessage): void {
    if (!message.data) {
      throw new Error("Payload missing for cleanup job");
    }

    console.log(`Cleanup completed for job ${message.jobId}`);
  }
}
