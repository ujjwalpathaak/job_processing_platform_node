export enum Queue {
  STANDARD = "STANDARD",
  CRITICAL = "CRITICAL",
  EXTERNAL = "EXTERNAL",
  RETRY5SEC = "RETRY5SEC",
  RETRY60SEC = "RETRY60SEC",
  RETRY300SEC = "RETRY300SEC",
  RETRY1500SEC = "RETRY1500SEC",
  RETRY_READY = "RETRY_READY",
}

export const RETRY_QUEUE_DELAYS: Array<{ queue: Queue; seconds: number }> = [
  { queue: Queue.RETRY5SEC, seconds: 5 },
  { queue: Queue.RETRY60SEC, seconds: 60 },
  { queue: Queue.RETRY300SEC, seconds: 300 },
  { queue: Queue.RETRY1500SEC, seconds: 1500 },
];

export const RETRY_QUEUES: Queue[] = RETRY_QUEUE_DELAYS.map(({ queue }) => queue);

const parseBackoffSeconds = (value: string): number | null => {
  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d+)(s|sec|secs|second|seconds|m|min|mins|minute|minutes)?$/);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? "s";

  if (["m", "min", "mins", "minute", "minutes"].includes(unit)) {
    return amount * 60;
  }

  return amount;
};

export const resolveRetryQueue = (backoffValue?: string): Queue => {
  const seconds = backoffValue ? parseBackoffSeconds(backoffValue) : null;

  if (!seconds) {
    return Queue.RETRY5SEC;
  }

  const matchingQueue = RETRY_QUEUE_DELAYS.find(
    ({ seconds: queueSeconds }) => seconds <= queueSeconds,
  );
  return matchingQueue?.queue ?? Queue.RETRY1500SEC;
};
