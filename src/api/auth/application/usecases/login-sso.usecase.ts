import { FindShallowUserByEmailUseCase } from "@/api/users/application/usecases/find-user-by-email.usecase";
import { Auth } from "../../domain/models/auth";
import { LoginDTO } from "../dtos/login";
import { InvalidGoogleAccessTokenException } from "../exceptions/invalid-google-access-token.exception";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserNotFoundException } from "@/api/users/application/exceptions/user-not-found.exception";
import { InvalidEmailAccessException } from "../exceptions/invalid-email-access.exception";
import { User } from "@/api/users/domain/models/user.model";
import { GoogleOAuthRepository } from "@/api/auth/domain/repositories/google-oauth.repository";
import { GoogleOAuthRepositoryImpl } from "@/api/auth/infrastructure/adapters/google-oauth.repository-impl";
import { JWTRepository } from "@/api/auth/domain/repositories/jwt.repository";
import { JWTRepositoryImpl } from "@/api/auth/infrastructure/adapters/jwt.repository-impl";
import { RefreshTokenPayload } from "../../domain/models/refresh-token-payload";
import { AccessTokenPayload } from "../../domain/models/access-token-payload";

interface LoginSSOUseCaseDependencies {
	findShallowUserByEmailUseCase?: FindShallowUserByEmailUseCase;
	jwtRepository?: JWTRepository;
	googleOAuthRepository?: GoogleOAuthRepository;
}

export class LoginSSOUseCase {
	private readonly findShallowUserByEmailUseCase: FindShallowUserByEmailUseCase;
	private readonly googleOAuthRepository: GoogleOAuthRepository;
	private readonly jwtRepository: JWTRepository;

	constructor(deps?: LoginSSOUseCaseDependencies) {
		this.findShallowUserByEmailUseCase =
			deps?.findShallowUserByEmailUseCase ??
			new FindShallowUserByEmailUseCase();
		this.jwtRepository =
			deps?.jwtRepository ?? new JWTRepositoryImpl();
		this.googleOAuthRepository =
			deps?.googleOAuthRepository ?? new GoogleOAuthRepositoryImpl();
	}

	async execute(dto: LoginDTO): Promise<Auth> {
		logger.info(`Use case LoginSSOUseCase started`);

		const { email, email_verified } =
			await this.googleOAuthRepository.validateAccessToken(
				dto.googleAccessToken,
			);
		if (!email_verified) {
			throw InvalidGoogleAccessTokenException.fromInvalidEmailVerification();
		}

		const user = await this.findUserByEmail(email);

		const auth = await this.generateAuth(user);

		logger.info("Use case LoginSSOUseCase completed successfully");

		return auth;
	}

	private async findUserByEmail(email: string): Promise<User> {
		try {
			return await this.findShallowUserByEmailUseCase.execute(email);
		} catch (e) {
			if (e instanceof UserNotFoundException)
				throw new InvalidEmailAccessException(email);

			throw e;
		}
	}

	private async generateAuth(user: User): Promise<Auth> {
		const accessPayload: AccessTokenPayload = {
			uuid: user.uuid,
			email: user.email,
			name: user.name,
		};

		const refreshPayload: RefreshTokenPayload = {
			uuid: user.uuid
		};

		const accessToken = await this.jwtRepository.signToken(
			accessPayload,
			"1d",
		);
		const refreshToken = await this.jwtRepository.signToken(
			refreshPayload,
			"7d",
		);

		return new Auth(accessToken, refreshToken);
	}
}
