import { CriticalJobConsumer } from "./critical-job-consumer";
import { ExternalJobConsumer } from "./external-job-consumer";
import { LogRagConsumer } from "./log-rag-consumer";
import { RetryRouterConsumer } from "./retry-router-consumer";
import { StandardJobConsumer } from "./standard-job-consumer";

export const startConsumers = async (): Promise<void> => {
  const standard = new StandardJobConsumer();
  const external = new ExternalJobConsumer();
  const critical = new CriticalJobConsumer();
  const retryRouter = new RetryRouterConsumer();
  const logRag = new LogRagConsumer();

  await Promise.all([
    standard.start(),
    external.start(),
    critical.start(),
    retryRouter.start(),
    logRag.start(),
  ]);
};
