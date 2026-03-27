import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
import { config } from "../../config/config";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
import { AbstractJobHandler } from "./abstract-job-handler";

export class EmailJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerTypes {
    return JobHandlerTypes.EMAIL;
  }

  public category(): JobCategories {
    return JobCategories.STANDARD;
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

  protected async execute(data: jobData): Promise<void> {
    await this.waitRandomMs(config.handlerDelayMs.emailMin, config.handlerDelayMs.emailMax);

    if (Math.random() < config.handlerFailureRate.email) {
      throw new Error("Invalid emailId");
    }

    Logger.handlerInfo(
      `Email handler completed successfully | sender=${data.from} | subject=${data.subject}`,
      undefined,
      this.identify(),
    );
  }
}
