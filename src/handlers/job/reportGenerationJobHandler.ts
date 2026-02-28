import { JobMessage } from "../../dto/JobMessage";
import { JobCategory, JobHandlerType } from "../../enums";
import { AbstractJobHandler } from "./abstractJobHandler";

export class ReportGenerationJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerType {
    return JobHandlerType.REPORT_GENERATION;
  }

  public category(): JobCategory {
    return JobCategory.STANDARD;
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
