import type { LoginRequestBody } from "../../presentation/dtos/requests/login";
import type { LoginDTO } from "../dtos/login";

export class AuthMapper {
  static toLoginDTO(data: LoginRequestBody): LoginDTO {
    return {
      googleAccessToken: data.googleAccessToken,
    };
  }
}
