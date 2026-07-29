import { execFile as execFileNode } from "node:child_process";
import { promisify } from "node:util";
import { withLogging } from "./handlers/tracing";
import { withErrorHandler } from "./handlers/exception";
import { ApiHandler } from "./types";

export const execFile = promisify(execFileNode);
export const buildRequest = (handler: ApiHandler) => {
  let req = handler;
  req = withLogging(req);
  req = withErrorHandler(req);
  return req;
};
