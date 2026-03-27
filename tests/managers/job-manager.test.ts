import { JobHandlerTypes, JobCategories } from "../../src/enums/job-enums";
import {
  getJobHandlerCategoryFromType,
  isValidJobHandlerType,
} from "../../src/managers/job-manager";

describe("job-manager", () => {
  it("returns category for known handler types", () => {
    expect(getJobHandlerCategoryFromType(JobHandlerTypes.EMAIL)).toBe(JobCategories.STANDARD);
    expect(getJobHandlerCategoryFromType(JobHandlerTypes.REFUND)).toBe(JobCategories.CRITICAL);
    expect(getJobHandlerCategoryFromType(JobHandlerTypes.CRM_SYNC)).toBe(JobCategories.EXTERNAL);
  });

  it("accepts valid handler values case-insensitively", () => {
    expect(isValidJobHandlerType("email")).toBe(true);
    expect(isValidJobHandlerType("EMAIL")).toBe(true);
    expect(isValidJobHandlerType("ReFuNd")).toBe(true);
  });

  it("rejects unsupported handler values", () => {
    expect(isValidJobHandlerType("unknown-handler")).toBe(false);
  });
});
