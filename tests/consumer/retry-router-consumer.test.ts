import { RetryRouterConsumer } from "../../src/consumer/retry-router-consumer";
import { Queue } from "../../src/enums/queue-enums";
import { JobCategories, JobHandlerTypes, JobStatuses } from "../../src/enums/job-enums";
import { Rabbit } from "../../src/config/rabbit";
import { updateHistory } from "../../src/repositories/job-repository";

jest.mock("../../src/config/rabbit", () => ({
  Rabbit: {
    getInstance: jest.fn(),
  },
}));

jest.mock("../../src/repositories/job-repository", () => ({
  updateHistory: jest.fn(),
}));

jest.mock("../../src/services/log-service", () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedGetInstance = Rabbit.getInstance as jest.MockedFunction<typeof Rabbit.getInstance>;
const mockedUpdateHistory = updateHistory as jest.MockedFunction<typeof updateHistory>;

describe("RetryRouterConsumer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUpdateHistory.mockResolvedValue(null);
  });

  it("republishes message and marks PUBLISHED on success", async () => {
    const ack = jest.fn();
    const nack = jest.fn();
    let consumeCallback: ((msg: any) => Promise<void>) | undefined;

    const channel = {
      consume: jest.fn(async (_queue: string, cb: (msg: any) => Promise<void>) => {
        consumeCallback = cb;
      }),
      ack,
      nack,
    };

    const rabbit = {
      createConsumerChannel: jest.fn(async () => channel),
      getQueueByCategory: jest.fn(() => Queue.STANDARD),
      publish: jest.fn(async () => true),
    };

    mockedGetInstance.mockResolvedValue(rabbit as never);

    const consumer = new RetryRouterConsumer();
    await consumer.start();

    expect(channel.consume).toHaveBeenCalledWith(Queue.RETRY_READY, expect.any(Function));

    await consumeCallback?.({
      content: Buffer.from(
        JSON.stringify({
          id: "job-1",
          category: JobCategories.STANDARD,
          handler: JobHandlerTypes.EMAIL,
          data: {},
          attempt: 2,
        }),
      ),
    });

    expect(rabbit.publish).toHaveBeenCalled();
    expect(mockedUpdateHistory).toHaveBeenCalledWith("job-1", JobStatuses.PUBLISHED);
    expect(ack).toHaveBeenCalled();
    expect(nack).not.toHaveBeenCalled();
  });

  it("marks ERROR/DEAD and nacks when republish fails", async () => {
    const ack = jest.fn();
    const nack = jest.fn();
    let consumeCallback: ((msg: any) => Promise<void>) | undefined;

    const channel = {
      consume: jest.fn(async (_queue: string, cb: (msg: any) => Promise<void>) => {
        consumeCallback = cb;
      }),
      ack,
      nack,
    };

    const rabbit = {
      createConsumerChannel: jest.fn(async () => channel),
      getQueueByCategory: jest.fn(() => Queue.STANDARD),
      publish: jest.fn(async () => false),
    };

    mockedGetInstance.mockResolvedValue(rabbit as never);

    const consumer = new RetryRouterConsumer();
    await consumer.start();

    await consumeCallback?.({
      content: Buffer.from(
        JSON.stringify({
          id: "job-2",
          category: JobCategories.STANDARD,
          handler: JobHandlerTypes.EMAIL,
          data: {},
          attempt: 2,
        }),
      ),
    });

    expect(mockedUpdateHistory).toHaveBeenCalledWith(
      "job-2",
      JobStatuses.ERROR,
      "Failed to republish job from retry queue",
    );
    expect(mockedUpdateHistory).toHaveBeenCalledWith(
      "job-2",
      JobStatuses.DEAD,
      "Retry republish failed",
    );
    expect(ack).not.toHaveBeenCalled();
    expect(nack).toHaveBeenCalled();
  });
});
