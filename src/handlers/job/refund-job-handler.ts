import { JobMessage } from "../../dto/job-message-dto";
import * as JobEnums from "../../enums/job-enums";
import { AbstractJobHandler } from "./abstract-job-handler";

export class RefundJobHandler extends AbstractJobHandler {
  public identify(): JobEnums.HandlerTypes {
    return JobEnums.HandlerTypes.REFUND;
  }

  public category(): JobEnums.Categories {
    return JobEnums.Categories.CRITICAL;
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
