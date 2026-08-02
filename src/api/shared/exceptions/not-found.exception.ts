import { constants } from "http2";
import { ApiException, ApiExceptionArgs } from "./api.exception";

export class NotFoundException extends ApiException {
  constructor(
    title: string,
    detail: string,
    errorCode?: string,
    errorArgs?: ApiExceptionArgs,
  ) {
    super(
      title,
      detail,
      constants.HTTP_STATUS_NOT_FOUND,
      `not-found${errorCode ? `.${errorCode}` : ""}`,
      errorArgs,
    );
  }
}
