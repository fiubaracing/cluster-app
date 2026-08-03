import {
	Endpoint,
	parseJSON,
	validator,
} from "@/api/shared/infrastructure/handlers";
import {
	LoginRequestBody,
	loginRequestBodySchema,
} from "../dtos/requests/login";
import { mapLoginDTO } from "../../application/mappers/auth.mapper";
import { LoginDTO } from "../../application/dtos/login";
import { Auth } from "../../domain/models/auth";
import { mapAuthResponse } from "../mappers/auth-response.mapper";
import { LoginSSOUseCase } from "@/api/auth/application/usecases/login-sso.usecase";
import { ApiRequest, ApiResponse } from "@/api/shared/types/api";

interface AuthControllerDependencies {
	loginSsoUseCase?: LoginSSOUseCase;
}

export default class AuthController {
	private loginSsoUseCase: LoginSSOUseCase;

	constructor(deps?: AuthControllerDependencies) {
		this.loginSsoUseCase = deps?.loginSsoUseCase ?? new LoginSSOUseCase();
	}

	@Endpoint()
	async login(req: ApiRequest) {
		const rawBody = await parseJSON(req);
		const body: LoginRequestBody = await validator(
			loginRequestBodySchema,
			rawBody,
		);

		const dto: LoginDTO = mapLoginDTO(body);
		const auth: Auth = await this.loginSsoUseCase.execute(dto);

		const response = ApiResponse.json('', { status: 200 });
		response.cookies.set({
			name: "accessToken",
			value: auth.access.token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Only HTTPS in production
			sameSite: "lax", // Protects against CSRF
			maxAge: 60 * 60 * 24 * 1, // 1 day in seconds
			path: "/",
		});

		response.cookies.set({
			name: "refreshToken",
			value: auth.refresh.token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
			path: "/",
		});

		return response;
	}
}
