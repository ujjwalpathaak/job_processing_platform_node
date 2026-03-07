import { JobMessage } from "../../dto/JobMessage";
import * as JobEnums from "../../enums/Job";
import { AbstractJobHandler } from "./abstractJobHandler";

export class NotificationCleanupJobHandler extends AbstractJobHandler {
  public identify(): JobEnums.HandlerTypes {
    return JobEnums.HandlerTypes.NOTIFICATION_CLEANUP;
  }

  public category(): JobEnums.Categories {
    return JobEnums.Categories.STANDARD;
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
