import { Queue, resolveRetryQueue } from "../../src/enums/queue-enums";

describe("resolveRetryQueue", () => {
  it("defaults to RETRY5SEC when backoff is missing", () => {
    expect(resolveRetryQueue()).toBe(Queue.RETRY5SEC);
  });

  it("maps second-based values correctly", () => {
    expect(resolveRetryQueue("5s")).toBe(Queue.RETRY5SEC);
    expect(resolveRetryQueue("60s")).toBe(Queue.RETRY60SEC);
    expect(resolveRetryQueue("120s")).toBe(Queue.RETRY300SEC);
    expect(resolveRetryQueue("301s")).toBe(Queue.RETRY1500SEC);
  });

  it("maps minute-based values correctly", () => {
    expect(resolveRetryQueue("1m")).toBe(Queue.RETRY60SEC);
    expect(resolveRetryQueue("5min")).toBe(Queue.RETRY300SEC);
  });

  it("falls back to RETRY5SEC for invalid values", () => {
    expect(resolveRetryQueue("abc")).toBe(Queue.RETRY5SEC);
    expect(resolveRetryQueue("0s")).toBe(Queue.RETRY5SEC);
  });
});
