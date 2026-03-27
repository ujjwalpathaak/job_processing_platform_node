import { JobHandlerTypes } from "../../src/enums/job-enums";
import { JobHandlerFactory } from "../../src/factory/job-handler-factory";

describe("JobHandlerFactory", () => {
  it("returns the correct handler for known types", () => {
    const handler = JobHandlerFactory.get(JobHandlerTypes.PAYMENT);
    expect(handler.identify()).toBe(JobHandlerTypes.PAYMENT);
  });

  it("throws for invalid handler type", () => {
    expect(() => JobHandlerFactory.get("" as JobHandlerTypes)).toThrow("Invalid handler type");
  });

  it("throws for unknown handler value", () => {
    expect(() => JobHandlerFactory.get("missing" as JobHandlerTypes)).toThrow(
      "No handler found for type=missing",
    );
  });
});
