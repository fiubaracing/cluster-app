import { FindShallowUserByEmailUseCase } from "@/api/users/application/usecases/find-user-by-email.usecase";
import { Auth } from "../../domain/models/auth";
import { LoginDTO } from "../dtos/login";
import { InvalidGoogleAccessTokenException } from "../exceptions/invalid-google-access-token.exception";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserNotFoundException } from "@/api/users/application/exceptions/user-not-found.exception";
import { InvalidEmailAccessException } from "../exceptions/invalid-email-access.exception";
import { User } from "@/api/users/domain/models/user.model";
import { SignTokenUseCase } from "./sign-token.usecase";
import { GoogleOAuthRepository } from "@/api/auth/domain/repositories/google-oauth.repository";
import { GoogleOAuthRepositoryImpl } from "@/api/auth/infrastructure/adapters/google-oauth.repository-impl";

interface LoginSSOUseCaseDependencies {
	findShallowUserByEmailUseCase?: FindShallowUserByEmailUseCase;
	signTokenUseCase?: SignTokenUseCase;
	googleOAuthRepository?: GoogleOAuthRepository;
}

export class LoginSSOUseCase {
	private readonly findShallowUserByEmailUseCase: FindShallowUserByEmailUseCase;
	private readonly googleOAuthRepository: GoogleOAuthRepository;
	private readonly signTokenUseCase: SignTokenUseCase;

	constructor(deps?: LoginSSOUseCaseDependencies) {
		this.findShallowUserByEmailUseCase =
			deps?.findShallowUserByEmailUseCase ??
			new FindShallowUserByEmailUseCase();
		this.signTokenUseCase =
			deps?.signTokenUseCase ?? new SignTokenUseCase();
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
		const accessPayload = {
			uuid: user.uuid,
			email: user.email,
			name: user.name,
		};

		const refreshPayload = {
			uuid: user.uuid,
			isRefreshToken: true,
		};

		const accessToken = await this.signTokenUseCase.execute(
			accessPayload,
			"1d",
		);
		const refreshToken = await this.signTokenUseCase.execute(
			refreshPayload,
			"7d",
		);

		return new Auth(accessToken, refreshToken);
	}
}
