import { JobMessage } from "../../dto/JobMessage";
import * as JobEnums from "../../enums/Job";
import { AbstractJobHandler } from "./abstractJobHandler";

export class ReportGenerationJobHandler extends AbstractJobHandler {
  public identify(): JobEnums.HandlerTypes {
    return JobEnums.HandlerTypes.REPORT_GENERATION;
  }

  public category(): JobEnums.Categories {
    return JobEnums.Categories.STANDARD;
  }

  public retries(): number {
    return 1;
  }

  public backoff(): string[] {
    return ["30s"];
  }

  protected async execute(message: JobMessage): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(`Report generated for job ${message.jobId}`);
  }
}
