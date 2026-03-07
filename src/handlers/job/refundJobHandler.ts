import { JobMessage } from "../../dto/JobMessage";
import * as JobEnums from "../../enums/Job";
import { AbstractJobHandler } from "./abstractJobHandler";

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
