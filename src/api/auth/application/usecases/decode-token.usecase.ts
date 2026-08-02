import { logger } from "@/api/shared/infrastructure/config/logger";
import { jwtVerify, errors } from "jose";
import { InvalidJWTException } from "../exceptions/invalid-jwt.exception";

export class DecodeTokenUseCase {
	private static JWT_SECRET: Uint8Array;

	get JWT_SECRET(): Uint8Array {
		if (DecodeTokenUseCase.JWT_SECRET) {
			return DecodeTokenUseCase.JWT_SECRET;
		}

		const secret = process.env.JWT_SECRET || "default_secret_key";
		DecodeTokenUseCase.JWT_SECRET = new TextEncoder().encode(secret);
		return DecodeTokenUseCase.JWT_SECRET;
	}

	async execute<T>(token: string): Promise<T> {
		logger.info(`Use case DecodeTokenUseCase started`);

		const decoded: T = await this.decodeToken<T>(token);

		logger.info("Use case DecodeTokenUseCase completed successfully");

		return decoded;
	}

	private async decodeToken<T>(token: string): Promise<T> {
		try {
			const { payload } = await jwtVerify(
				token,
				DecodeTokenUseCase.JWT_SECRET,
			);
			return payload as T;
		} catch (error) {
			if (error instanceof errors.JWTExpired) {
				throw InvalidJWTException.fromExpired();
			}

			if (error instanceof errors.JWTInvalid) {
				throw InvalidJWTException.fromInvalid();
			}

			throw InvalidJWTException.fromUnknown();
		}
	}
}
