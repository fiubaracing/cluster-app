import { constants } from "http2";
import { ApiException } from "./api.exception";

export class InternalServerErrorException extends ApiException {
  constructor(cause: Error) {
    super(
      "Internal Server Error",
      "An unexpected error occurred. Please try again later.",
      constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
      `internal-server-error`,
    );
    this.cause = cause;
  }
}
