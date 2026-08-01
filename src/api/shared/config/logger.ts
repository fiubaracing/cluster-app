import { AsyncLocalStorage } from "node:async_hooks";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const traceStorage = new AsyncLocalStorage<string>();

const traceIdFormat = format((info) => {
  const traceId = traceStorage.getStore();
  if (traceId) {
    info.traceId = traceId;
  }
  return info;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: format.combine(
    format.timestamp(),
    traceIdFormat(), // Injects traceId if available
    format.json(), // Outputs clean JSON for production log viewers
  ),
  transports: [
    new transports.Console(),

    new DailyRotateFile({
      filename: "logs/%DATE%.log", // %DATE% is replaced by the datePattern
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d", // Automatically deletes files older than 14 days (2 weeks)
    }),
  ],
});
