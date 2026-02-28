import { JobMessage } from "../../dto/JobMessage";
import { JobCategory, JobHandlerType } from "../../enums";
import { AbstractJobHandler } from "./abstractJobHandler";

export class WebhookTriggerJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerType {
    return JobHandlerType.WEBHOOK_TRIGGER;
  }

  public category(): JobCategory {
    return JobCategory.EXTERNAL;
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
