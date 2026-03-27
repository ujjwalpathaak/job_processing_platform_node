import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
import { config } from "../../config/config";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
import { AbstractJobHandler } from "./abstract-job-handler";

export class WebhookTriggerJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerTypes {
    return JobHandlerTypes.WEBHOOK_TRIGGER;
  }

  public category(): JobCategories {
    return JobCategories.EXTERNAL;
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
    await this.waitRandomMs(config.handlerDelayMs.webhookMin, config.handlerDelayMs.webhookMax);

    if (Math.random() < config.handlerFailureRate.webhook) {
      throw new Error("Webhook responded with HTTP 502");
    }

    Logger.handlerInfo(
      "Webhook handler completed successfully | action=webhook_delivered",
      undefined,
      this.identify(),
    );
  }
}
