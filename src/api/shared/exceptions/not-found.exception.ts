import { constants } from "http2";
import { ApiException, ApiExceptionExtension } from "./api.exception";

export default class NotFoundException extends ApiException {
  constructor(
    title: string,
    detail: string,
    errorCode?: string,
    errorArgs?: Record<string, object>,
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
