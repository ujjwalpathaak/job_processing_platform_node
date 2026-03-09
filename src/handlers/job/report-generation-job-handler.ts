import { JobMessage } from "../../dto/job-dtos";
import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
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

  protected async execute(message: JobMessage): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(`Report generated for job ${message.jobId}`);
  }
}
