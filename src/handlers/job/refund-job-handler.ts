import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
import { config } from "../../config/config";
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
  protected async execute(_data: jobData): Promise<void> {
    await this.waitRandomMs(config.handlerDelayMs.refundMin, config.handlerDelayMs.refundMax);

    if (Math.random() < config.handlerFailureRate.refund) {
      throw new Error("Duplicate refund detected");
    }

    Logger.handlerInfo(
      "Refund handler completed successfully | action=refund_completed",
      undefined,
      this.identify(),
    );
  }
}
