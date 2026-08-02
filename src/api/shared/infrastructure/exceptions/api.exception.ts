export class ApiException extends Error {
  title: string;
  detail: string;
  status: number;
  instance: string;
  type: string;
  extensions: ApiExceptionExtension;

  constructor(
    title: string,
    detail: string,
    status: number,
    errorCode: string,
    errorArgs?: ApiExceptionArgs
  ) {
    super(detail);
    this.title = title;
    this.detail = detail;
    this.status = status;
    this.instance = "<URL>";
    this.type = "about:blank";
    this.name = this.constructor.name;
    this.extensions = {
      code: `errors${errorCode ? `.${errorCode}` : ""}`,
      args: errorArgs,
      timestamp: new Date().toISOString(),
      traceId: "",
    };
    Error.captureStackTrace(this, this.constructor);
  }
}

export type ApiExceptionArgs = Record<string, any>;

export interface ApiExceptionExtension {
  code: string;
  args?: ApiExceptionArgs;
  timestamp: string;
  traceId: string;
}
