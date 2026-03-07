import { JobMessage } from "../../dto/JobMessage";
import * as JobEnums from "../../enums/Job";
import { AbstractJobHandler } from "./abstractJobHandler";

export class EmailJobHandler extends AbstractJobHandler {
  public identify(): JobEnums.HandlerTypes {
    return JobEnums.HandlerTypes.EMAIL;
  }

  public category(): JobEnums.Categories {
    return JobEnums.Categories.STANDARD;
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
