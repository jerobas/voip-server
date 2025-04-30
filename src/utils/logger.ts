import winston from "winston";
import LokiTransport from "winston-loki";

const logger = winston.createLogger({
  transports: [
    new LokiTransport({
      host: "http://localhost:3100",
      labels: { job: "queemo" },
      json: true,
      replaceTimestamp: true,
    }),
  ],
});

export default logger;
