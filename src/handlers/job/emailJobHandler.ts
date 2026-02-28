import { JobMessage } from "../../dto/JobMessage";
import { JobCategory, JobHandlerType } from "../../enums";
import { AbstractJobHandler } from "./abstractJobHandler";

export class EmailJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerType {
    return JobHandlerType.EMAIL;
  }

  public category(): JobCategory {
    return JobCategory.STANDARD;
  }

  public retries(): number {
    return 2;
  }

  public backoff(): string[] {
    return ["5s", "30s"];
  }

  protected execute(message: JobMessage): void {
    if (Math.random() < 0.3) {
      throw new Error("Invalid emailId");
    }

    console.log(`Email sent for job ${message.jobId}`);
  }
}
