import { AbstractJobConsumer } from "../../src/consumer/abstract-job-consumer";
import { JobMessage } from "../../src/dto/job-dtos";
import { JobCategories, JobHandlerTypes, JobStatuses } from "../../src/enums/job-enums";
import { JobHandlerFactory } from "../../src/factory/job-handler-factory";
import { updateHistory } from "../../src/repositories/job-repository";
import { pushMessageToRetryQueue } from "../../src/services/job-producer";

jest.mock("../../src/factory/job-handler-factory", () => ({
  JobHandlerFactory: {
    get: jest.fn(),
  },
}));

jest.mock("../../src/repositories/job-repository", () => ({
  updateHistory: jest.fn(),
}));

jest.mock("../../src/services/job-producer", () => ({
  pushMessageToRetryQueue: jest.fn(),
}));

jest.mock("../../src/services/log-service", () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    handlerError: jest.fn(),
  },
}));

class TestStandardConsumer extends AbstractJobConsumer {
  protected consumerName = "TestStandardConsumer";
  protected category = JobCategories.STANDARD;

  public async run(message: JobMessage): Promise<void> {
    await this.consumeInternal(message);
  }
}

const mockedFactoryGet = JobHandlerFactory.get as jest.MockedFunction<typeof JobHandlerFactory.get>;
const mockedUpdateHistory = updateHistory as jest.MockedFunction<typeof updateHistory>;
const mockedPushToRetry = pushMessageToRetryQueue as jest.MockedFunction<
  typeof pushMessageToRetryQueue
>;

const baseMessage: JobMessage = {
  id: "job-1",
  category: JobCategories.STANDARD,
  handler: JobHandlerTypes.EMAIL,
  data: { value: 1 },
  attempt: 1,
};

describe("AbstractJobConsumer lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUpdateHistory.mockResolvedValue(null);
    mockedPushToRetry.mockResolvedValue(true);
  });

  it("marks job as PROCESSED when handler succeeds", async () => {
    mockedFactoryGet.mockReturnValue({
      identify: () => JobHandlerTypes.EMAIL,
      category: () => JobCategories.STANDARD,
      retries: () => 2,
      backoff: () => ["5s", "30s"],
      process: jest.fn().mockResolvedValue(undefined),
    });

    const consumer = new TestStandardConsumer();
    await consumer.run(baseMessage);

    expect(mockedUpdateHistory).toHaveBeenCalledWith(baseMessage.id, JobStatuses.PROCESSING);
    expect(mockedUpdateHistory).toHaveBeenCalledWith(baseMessage.id, JobStatuses.PROCESSED);
    expect(mockedPushToRetry).not.toHaveBeenCalled();
  });

  it("schedules retry when handler fails and retries remain", async () => {
    mockedFactoryGet.mockReturnValue({
      identify: () => JobHandlerTypes.EMAIL,
      category: () => JobCategories.STANDARD,
      retries: () => 2,
      backoff: () => ["5s", "30s"],
      process: jest.fn().mockRejectedValue(new Error("boom")),
    });

    const consumer = new TestStandardConsumer();
    await consumer.run(baseMessage);

    expect(mockedUpdateHistory).toHaveBeenCalledWith(baseMessage.id, JobStatuses.PROCESSING);
    expect(mockedUpdateHistory).toHaveBeenCalledWith(baseMessage.id, JobStatuses.RETRY, "boom");
    expect(mockedPushToRetry).toHaveBeenCalledWith(
      {
        ...baseMessage,
        attempt: 2,
      },
      "30s",
    );
  });

  it("marks job ERROR and DEAD when retry publish fails", async () => {
    mockedFactoryGet.mockReturnValue({
      identify: () => JobHandlerTypes.EMAIL,
      category: () => JobCategories.STANDARD,
      retries: () => 2,
      backoff: () => ["5s", "30s"],
      process: jest.fn().mockRejectedValue(new Error("retry-publish-error")),
    });
    mockedPushToRetry.mockResolvedValue(false);

    const consumer = new TestStandardConsumer();
    await consumer.run(baseMessage);

    expect(mockedUpdateHistory).toHaveBeenCalledWith(
      baseMessage.id,
      JobStatuses.ERROR,
      "Failed to push job to retry queue",
    );
    expect(mockedUpdateHistory).toHaveBeenCalledWith(
      baseMessage.id,
      JobStatuses.DEAD,
      "retry-publish-error",
    );
  });

  it("marks job ERROR and DEAD when retries are exhausted", async () => {
    mockedFactoryGet.mockReturnValue({
      identify: () => JobHandlerTypes.EMAIL,
      category: () => JobCategories.STANDARD,
      retries: () => 2,
      backoff: () => ["5s", "30s"],
      process: jest.fn().mockRejectedValue(new Error("exhausted")),
    });

    const consumer = new TestStandardConsumer();
    await consumer.run({
      ...baseMessage,
      attempt: 3,
    });

    expect(mockedPushToRetry).not.toHaveBeenCalled();
    expect(mockedUpdateHistory).toHaveBeenCalledWith(
      baseMessage.id,
      JobStatuses.ERROR,
      "exhausted",
    );
    expect(mockedUpdateHistory).toHaveBeenCalledWith(baseMessage.id, JobStatuses.DEAD, "exhausted");
  });
});
