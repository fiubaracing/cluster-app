import { ApiHandler } from "../types/api";
import { TRACE_HEADER } from "../consts/header";
import { traceStorage, logger } from "../config/logger";

export function withLogging(handler: ApiHandler) {
	return async function (this: unknown, req: Request, ...args: any[]) {
		// Extract the header from the client, or generate a fallback timestamp string if missing
		const traceId = req.headers.get(TRACE_HEADER) || crypto.randomUUID();

		// Bind the remainder of the request execution context to this specific trace ID
		return traceStorage.run(traceId, async () => {
			logger.info(`HTTP ${req.method} ${req.url} - Started`);

			req.headers.set(TRACE_HEADER, traceId);
			const response = await handler.call(this, req, ...args);
			response.headers.set(TRACE_HEADER, traceId);

			logger.info(
				`HTTP ${req.method} ${req.url} - Completed with status ${response.status}`,
			);
			return response;
		});
	};
}
