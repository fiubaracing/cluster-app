export type ApiHandler = (
  req: Request,
  ...args: any[]
) => Promise<Response> | Response;

export const TRACE_HEADER = "x-trace-id";
