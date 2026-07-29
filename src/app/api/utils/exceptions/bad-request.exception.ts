import { ApiException, ApiExceptionExtension } from "./api.exception";
import { constants } from "http2";

export default class BadRequestException extends ApiException {
  constructor(
    title: string,
    detail: string,
    errorCode?: string,
    errorArgs?: Record<string, object>,
  ) {
    super(
      title,
      detail,
      constants.HTTP_STATUS_BAD_REQUEST,
      `bad-request${errorCode ? `.${errorCode}` : ""}`,
      errorArgs,
    );
  }
}
