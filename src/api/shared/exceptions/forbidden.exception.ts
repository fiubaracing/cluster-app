import { constants } from "http2";
import { ApiException, ApiExceptionExtension } from "./api.exception";

export default class ForbiddenException extends ApiException {
  constructor(
    title: string,
    detail: string,
    errorCode: string,
    errorArgs?: Record<string, object>,
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
