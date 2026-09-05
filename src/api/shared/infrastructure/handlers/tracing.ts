import { ApiHandler } from "../../types/api";
import { TRACE_HEADER } from "../consts/header";
import { logger } from "../config/logger";
import { ApiRequest } from "@/api/shared/types/api";
import context, { Context } from "../config/store";

export function withLogging(handler: ApiHandler) {
	return async function (this: unknown, req: ApiRequest, ...args: any[]) {
		return context.run(async (ctx: Context) => {
			logger.info(`HTTP ${req.method} ${req.url} - Started`);

			req.headers.set(TRACE_HEADER, ctx.traceId);
			const response = await handler.call(this, req, ...args);
			response.headers.set(TRACE_HEADER, ctx.traceId);

			logger.info(
				`HTTP ${req.method} ${req.url} - Completed with status ${response.status}`,
			);
			return response;
		});
	};
}
