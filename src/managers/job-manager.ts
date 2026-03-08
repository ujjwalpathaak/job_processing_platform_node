import { Categories, HandlerTypes } from "../enums/job-enums";
import { jobHandlers } from "../handlers/job";
import { JobHandler } from "../interfaces/job-interfaces";

export const getJobHandlerCategoryFromType = (jobHandlerType: HandlerTypes): Categories => {
  const handler: JobHandler | undefined = jobHandlers[jobHandlerType]
    ? jobHandlers[jobHandlerType]
    : undefined;
  if (!handler) {
    throw new Error("Unsupported handler");
  }

  return handler.category();
};

export const isValidHandler = (value: string): boolean => {
  const handlerType = Object.values(HandlerTypes).find(
    (type) => type.toLowerCase() === value.toLowerCase(),
  );
  return !!handlerType;
};
