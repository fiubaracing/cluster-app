import { LoginDTO } from "../dtos/login";
import { LoginRequestBody } from "../../presentation/dtos/requests/login";

export class AuthMapper {
	static toLoginDTO(data: LoginRequestBody): LoginDTO {
		return {
			googleAccessToken: data.googleAccessToken,
		};
	}
}