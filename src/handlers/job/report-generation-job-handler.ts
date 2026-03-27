import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
import { config } from "../../config/config";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
import { AbstractJobHandler } from "./abstract-job-handler";

export class ReportGenerationJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerTypes {
    return JobHandlerTypes.REPORT_GENERATION;
  }

  public category(): JobCategories {
    return JobCategories.STANDARD;
  }

  public retries(): number {
    return 1;
  }

  public backoff(): string[] {
    return ["30s"];
  }
  public process(data: jobData): Promise<void> {
    return super.process(data);
  }

  protected async execute(data: jobData): Promise<void> {
    await this.waitRandomMs(config.handlerDelayMs.reportMin, config.handlerDelayMs.reportMax);
    Logger.handlerInfo(
      `Report-generation handler completed successfully | reportJobId=${data.id}`,
      undefined,
      this.identify(),
    );
  }
}
