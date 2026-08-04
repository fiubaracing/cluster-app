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
import { LoginSSOUseCase } from "@/api/auth/application/usecases/login-sso.usecase";
import { ApiRequest, ApiResponse } from "@/api/shared/types/api";
import { BlankTokenException } from "../../application/exceptions/blank-token.exception";
import { RefreshTokenUseCase } from "../../application/usecases/refresh-token.usecase";
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "@/api/shared/infrastructure/consts/token-ttl";

interface AuthControllerDependencies {
	loginSsoUseCase?: LoginSSOUseCase;
	refreshTokenUseCase?: RefreshTokenUseCase;
}

export default class AuthController {
	private readonly loginSsoUseCase: LoginSSOUseCase;
	private readonly refreshTokenUseCase: RefreshTokenUseCase;

	constructor(deps?: AuthControllerDependencies) {
		this.loginSsoUseCase = deps?.loginSsoUseCase ?? new LoginSSOUseCase();
		this.refreshTokenUseCase = deps?.refreshTokenUseCase ?? new RefreshTokenUseCase();
	}

	@Endpoint({ auth: false })
	async login(req: ApiRequest) {
		const rawBody = await parseJSON(req);
		const body: LoginRequestBody = await validator(
			loginRequestBodySchema,
			rawBody,
		);

		const dto: LoginDTO = mapLoginDTO(body);
		const auth: Auth = await this.loginSsoUseCase.execute(dto);

		const response = ApiResponse.json('', { status: 200 });
		this.setAuthCookie(response, "accessToken", auth.access.token, ACCESS_TOKEN_TTL_SECONDS);
		this.setAuthCookie(response, "refreshToken", auth.refresh.token, REFRESH_TOKEN_TTL_SECONDS);

		return response;
	}

	@Endpoint ({ auth: false })
	async refresh(req: ApiRequest) {
		const refreshToken = req.cookies.get("refreshToken")?.value;
		if (!refreshToken) {
			return BlankTokenException.fromRefreshToken();
		}

		const newAccessToken = await this.refreshTokenUseCase.execute(refreshToken);

		const response = ApiResponse.json('', { status: 200 });
		this.setAuthCookie(response, "accessToken", newAccessToken, ACCESS_TOKEN_TTL_SECONDS);

		return response;
	}

	private setAuthCookie(response: ApiResponse, name: string, token: string, maxAge: number) {
		response.cookies.set({
			name,
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: maxAge, // 1 day in seconds
			path: "/",
		});
	}
}
