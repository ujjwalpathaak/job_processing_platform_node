import { JobMessage } from "../../dto/job-dtos";
import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
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

  protected async execute(_message: JobMessage): Promise<void> {
    await this.simulateNetworkLatency();

    if (Math.random() < 0.4) {
      throw new Error("Webhook responded with HTTP 502");
    }

    console.log("Webhook delivered successfully");
  }

  private async simulateNetworkLatency(): Promise<void> {
    const delayMs = Math.floor(Math.random() * 2000);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
