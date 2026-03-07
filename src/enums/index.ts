import * as Job from "./Job";

export function toJobHandlerType(value: string): Job.HandlerTypes | undefined {
  return Object.values(Job.HandlerTypes).includes(value as Job.HandlerTypes)
    ? (value as Job.HandlerTypes)
    : undefined;
}
