import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
import { AbstractJobHandler } from "./abstract-job-handler";

export class RefundJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerTypes {
    return JobHandlerTypes.REFUND;
  }

  public category(): JobCategories {
    return JobCategories.CRITICAL;
  }

  public retries(): number {
    return 3;
  }

  public backoff(): string[] {
    return ["5s", "30s", "60s"];
  }
  public process(data: jobData): Promise<void> {
    return super.process(data);
  }
  protected execute(_data: jobData): void {
    if (Math.random() < 0.3) {
      throw new Error("Duplicate refund detected");
    }

    Logger.handlerInfo("Refund completed");
  }
}
