import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import context from "./store";

const traceIdFormat = format((info) => {
	const traceId = context.store?.traceId;
	if (traceId) {
		info.traceId = traceId;
	}
	return info;
});

const emailFormat = format((info) => {
	const email = context.store?.user.email;
	if (email) {
		info.email = email;
	}
	return info;
});

const customLayout = format.printf(({ timestamp, level, message, traceId, email }) => {
	const logParts = [`[${timestamp}]`, `[${level.toUpperCase()}]`];

	if (traceId) {
		logParts.push(`[${traceId}]`);
	}

	if (email) {
		logParts.push(`[${email}]`);
	}

	logParts.push(`${message}`);

	return logParts.join(" ");
});

export const logger = createLogger({
	level: process.env.NODE_ENV === "development" ? "debug" : "info",
	format: format.combine(
		format.timestamp(),
		traceIdFormat(), // Injects traceId if available
		emailFormat(), // Injects email if available
		customLayout
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
