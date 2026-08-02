import { LoginDTO } from "../dtos/login";
import { LoginRequestBody } from "../../presentation/dtos/requests/login";

export const mapLoginDTO = (data: LoginRequestBody): LoginDTO => {
	return {
		googleAccessToken: data.googleAccessToken,
	};
};
