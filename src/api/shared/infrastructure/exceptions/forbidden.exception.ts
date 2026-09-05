import { constants } from "http2";
import { ApiException, ApiExceptionArgs } from "./api.exception";

export class ForbiddenException extends ApiException {
  constructor(
    title: string,
    detail: string,
    errorCode: string,
    errorArgs?: ApiExceptionArgs,
  ) {
    super(
      title,
      detail,
      constants.HTTP_STATUS_FORBIDDEN,
      `forbidden${errorCode ? `.${errorCode}` : ""}`,
      errorArgs,
    );
  }
}
