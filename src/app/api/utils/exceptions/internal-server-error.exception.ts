import { constants } from "http2";
import { ApiException } from "./api.exception";

export default class InternalServerErrorException extends ApiException {
  constructor() {
    super(
      "Internal Server Error",
      "An unexpected error occurred. Please try again later.",
      constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
      `internal-server-error`,
    );
  }
}
