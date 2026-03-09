import { JobMessage } from "../../dto/job-dtos";
import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
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

  protected execute(message: JobMessage): void {
    if (!message.data) {
      throw new Error("Payload missing for cleanup job");
    }

    console.log(`Cleanup completed for job ${message.jobId}`);
  }
}
