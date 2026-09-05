import { logger } from "@/api/shared/infrastructure/config/logger";
import { JWTPayload, SignJWT, jwtVerify, errors } from "jose";
import { InvalidJWTException } from "@/api/auth/infrastructure/exceptions/invalid-jwt.exception";
import { JWTRepository } from "@/api/auth/domain/repositories/jwt.repository";

export class JWTRepositoryImpl implements JWTRepository {
	private static _JWT_SECRET: Uint8Array;

	private get JWT_SECRET(): Uint8Array {
		if (JWTRepositoryImpl._JWT_SECRET) {
			return JWTRepositoryImpl._JWT_SECRET;
		}

		const secret = process.env.JWT_SECRET || "default_secret_key";
		JWTRepositoryImpl._JWT_SECRET = new TextEncoder().encode(secret);
		return JWTRepositoryImpl._JWT_SECRET;
	}

	async signToken<T>(payload: T, expiresAt: string): Promise<string> {
        logger.info("Signing JWT token");
		
        const casted = payload as unknown as JWTPayload;
		return await new SignJWT({ ...casted })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime(expiresAt)
			.sign(this.JWT_SECRET);
	}

	async decodeToken<T>(token: string): Promise<T> {
        logger.info("Decoding JWT token");

        try {
			const { payload } = await jwtVerify(
				token,
				this.JWT_SECRET,
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
