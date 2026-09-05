import { FindShallowUserByEmailUseCase } from "@/api/users/application/usecases/find-user-by-email.usecase";
import { Auth } from "@/api/auth/domain/models/auth";
import { LoginDTO } from "../dtos/login";
import { InvalidGoogleAccessTokenException } from "@/api/auth/application/exceptions/invalid-google-access-token.exception";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserNotFoundException } from "@/api/users/application/exceptions/user-not-found.exception";
import { InvalidEmailAccessException } from "@/api/auth/application/exceptions/invalid-email-access.exception";
import { User } from "@/api/users/domain/models/user.model";
import { GoogleOAuthRepository } from "@/api/auth/domain/repositories/google-oauth.repository";
import { GoogleOAuthRepositoryImpl } from "@/api/auth/infrastructure/adapters/google-oauth.repository-impl";
import { GenerateTokensUseCase } from "@/api/auth/application/usecases/generate-tokens.usecase";

interface LoginSSOUseCaseDependencies {
	findShallowUserByEmailUseCase?: FindShallowUserByEmailUseCase;
	googleOAuthRepository?: GoogleOAuthRepository;
	generateTokensUseCase?: GenerateTokensUseCase;
}

export class LoginSSOUseCase {
	private readonly findShallowUserByEmailUseCase: FindShallowUserByEmailUseCase;
	private readonly googleOAuthRepository: GoogleOAuthRepository;
	private readonly generateTokensUseCase: GenerateTokensUseCase;

	constructor(deps?: LoginSSOUseCaseDependencies) {
		this.findShallowUserByEmailUseCase =
			deps?.findShallowUserByEmailUseCase ??
			new FindShallowUserByEmailUseCase();
		this.generateTokensUseCase =
			deps?.generateTokensUseCase ?? new GenerateTokensUseCase();
		this.googleOAuthRepository =
			deps?.googleOAuthRepository ?? new GoogleOAuthRepositoryImpl();
	}

	/**
	 * Executes the login process using Single Sign-On (SSO) with Google OAuth.
	 * Validates the provided Google access token, retrieves the associated user,
	 * and generates authentication tokens (access and refresh).
	 * @param dto - The data transfer object containing the Google access token.
	 * @returns A promise that resolves to an Auth object containing the access and refresh tokens.
	 */
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

		const auth = await this.generateTokensUseCase.execute(user);

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
}
