import { config } from "../../config/config";
import { JobCategories, JobHandlerTypes } from "../../enums/job-enums";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
import { AbstractJobHandler } from "./abstract-job-handler";

export class PaymentJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerTypes {
    return JobHandlerTypes.PAYMENT;
  }

  public category(): JobCategories {
    return JobCategories.CRITICAL;
  }

  public retries(): number {
    return 2;
  }

  public backoff(): string[] {
    return ["5s", "30s"];
  }

  public process(data: jobData): Promise<void> {
    return super.process(data);
  }

  protected async execute(_data: jobData): Promise<void> {
    await this.waitRandomMs(config.handlerDelayMs.refundMin, config.handlerDelayMs.refundMax);

    if (Math.random() < config.handlerFailureRate.refund) {
      throw new Error("Payment gateway declined transaction");
    }

    Logger.handlerInfo(
      "Payment handler completed successfully | action=payment_processed",
      undefined,
      this.identify(),
    );
  }
}
