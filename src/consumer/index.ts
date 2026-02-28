import { CriticalJobConsumer } from "./criticalJobConsumer";
import { ExternalJobConsumer } from "./externalJobConsumer";
import { RetryRouterConsumer } from "./retryRouterConsumer";
import { StandardJobConsumer } from "./standardJobConsumer";

export const startConsumers = () => {
  const standard = new StandardJobConsumer();
  const external = new ExternalJobConsumer();
  const critical = new CriticalJobConsumer();
  const retryRouter = new RetryRouterConsumer();

  return {
    standard,
    external,
    critical,
    retryRouter,
  };
};
