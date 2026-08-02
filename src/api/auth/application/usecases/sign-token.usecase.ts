import { logger } from "@/api/shared/infrastructure/config/logger";
import { JWTPayload, SignJWT } from "jose";

export class SignTokenUseCase {
	private static _JWT_SECRET: Uint8Array;

	private get JWT_SECRET(): Uint8Array {
		if (SignTokenUseCase._JWT_SECRET) {
			return SignTokenUseCase._JWT_SECRET;
		}

		const secret = process.env.JWT_SECRET || "default_secret_key";
		SignTokenUseCase._JWT_SECRET = new TextEncoder().encode(secret);
		return SignTokenUseCase._JWT_SECRET;
	}

	async execute<T>(payload: T, expiresAt: string): Promise<string> {
		logger.info(`Use case SignTokenUseCase started`);

		const token: string = await this.signToken<T>(payload, expiresAt);

		logger.info("Use case SignTokenUseCase completed successfully");

		return token;
	}

	private async signToken<T>(payload: T, expiresAt: string): Promise<string> {
		const casted = payload as unknown as JWTPayload;
		return await new SignJWT({ ...casted })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime(expiresAt)
			.sign(this.JWT_SECRET);
	}
}
