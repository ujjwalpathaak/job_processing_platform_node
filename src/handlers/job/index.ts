import { EmailJobHandler } from "./emailJobHandler";
import * as JobEnums from "../../enums/Job";
import { JobHandler } from "../../interfaces/Job";

export const jobHandlers: Partial<Record<JobEnums.HandlerTypes, JobHandler>> = {
  [JobEnums.HandlerTypes.EMAIL]: new EmailJobHandler(),
};
