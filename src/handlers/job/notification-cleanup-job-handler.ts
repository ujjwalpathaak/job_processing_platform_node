import { JobMessage } from "../../dto/job-message-dto";
import * as JobEnums from "../../enums/job-enums";
import { AbstractJobHandler } from "./abstract-job-handler";

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
