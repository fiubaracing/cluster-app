// utils/withErrorHandler.ts
import { ApiException } from "../exceptions/api.exception";
import InternalServerErrorException from "../exceptions/internal-server-error.exception";
import { ApiHandler, TRACE_HEADER } from "../types";
import { logger } from "../config/logger";

export function withErrorHandler(handler: ApiHandler) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (e) {
      const error = castError(e);
      error.instance = req.method + " " + req.url;
      error.extensions.traceId = req.headers.get(TRACE_HEADER) as string;

      console.error("API Error", error);

      return mapResponse(error);
    }
  };
}

const castError = (e: unknown): ApiException => {
  if (e instanceof ApiException) {
    return e;
  } else {
    return new InternalServerErrorException();
  }
};

const mapResponse = (e: ApiException): Response => {
  return Response.json(e, { status: e.status.valueOf() });
};
