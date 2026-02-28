import { JobMessage } from "../../dto/JobMessage";
import { JobCategory, JobHandlerType } from "../../enums";
import { AbstractJobHandler } from "./abstractJobHandler";

export class CrmSyncJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerType {
    return JobHandlerType.CRM_SYNC;
  }

  public category(): JobCategory {
    return JobCategory.EXTERNAL;
  }

  public retries(): number {
    return 2;
  }

  public backoff(): string[] {
    return ["5s", "60s"];
  }

  protected async execute(_message: JobMessage): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    throw new Error("CRM API timeout");
  }
}
