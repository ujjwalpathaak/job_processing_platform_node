import { JobMessage } from "../../dto/JobMessage";
import { JobCategory, JobHandlerType } from "../../enums";
import { AbstractJobHandler } from "./abstractJobHandler";

export class RefundJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerType {
    return JobHandlerType.REFUND;
  }

  public category(): JobCategory {
    return JobCategory.CRITICAL;
  }

  public retries(): number {
    return 3;
  }

  public backoff(): string[] {
    return ["5s", "30s", "60s"];
  }

  protected execute(_message: JobMessage): void {
    if (Math.random() < 0.3) {
      throw new Error("Duplicate refund detected");
    }

    console.log("Refund completed");
  }
}
