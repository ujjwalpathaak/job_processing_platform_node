import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
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
    await this.simulateNetworkLatency();

    if (Math.random() < 0.4) {
      throw new Error("Webhook responded with HTTP 502");
    }

    Logger.handlerInfo("Webhook delivered successfully");
  }

  private async simulateNetworkLatency(): Promise<void> {
    const delayMs = Math.floor(Math.random() * 2000);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
