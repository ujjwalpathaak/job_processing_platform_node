import * as JobEnums from "../enums/Job";
import { jobHandlers } from "../handlers/job";
import { JobHandler } from "../interfaces/Job";

const JobManager = {
  getJobHandlerCategoryFromType(jobHandlerType: JobEnums.HandlerTypes): JobEnums.Categories {
    const handler: JobHandler | undefined = jobHandlers[jobHandlerType]
      ? jobHandlers[jobHandlerType]
      : undefined;
    if (!handler) {
      throw new Error("Unsupported handler");
    }

    return handler.category();
  },
  getJobHandlerType(value: string): JobEnums.HandlerTypes {
    const handlerType = Object.values(JobEnums.HandlerTypes).find(
      (type) => type.toLowerCase() === value.toLowerCase(),
    );
    if (!handlerType) {
      throw new Error(`Invalid handler type: ${value}`);
    }
    return handlerType;
  },
};

export default JobManager;
