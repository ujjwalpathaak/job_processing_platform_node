import { Queue } from "bullmq";
import { config } from "../config";

const queue = new Queue("jobQueue", {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

export default queue;
