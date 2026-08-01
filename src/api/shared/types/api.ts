export type ApiHandler = (
  req: Request,
  ...args: any[]
) => Promise<Response> | Response;