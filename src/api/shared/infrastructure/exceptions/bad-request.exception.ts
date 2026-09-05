import { ApiException, ApiExceptionArgs } from "./api.exception";
import { constants } from "http2";

export class BadRequestException extends ApiException {
  constructor(
    title: string,
    detail: string,
    errorCode?: string,
    errorArgs?: ApiExceptionArgs,
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
