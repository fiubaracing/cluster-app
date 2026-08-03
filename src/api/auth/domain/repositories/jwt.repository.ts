export interface JWTRepository {
	/**
	 * Signs a JWT token with the given payload and expiration time.
	 * @template T The type of the payload to be signed.
	 * @param payload The payload to be included in the JWT token.
	 * @param expiresAt  The expiration time of the token in seconds or a string representing a time span (e.g., "1h", "2d").
	 * @returns A promise that resolves to the signed JWT token as a string.
	 */
	signToken<T>(payload: T, expiresAt: string): Promise<string>;

	/**
	 * Decodes a JWT token and returns the payload.
	 * @template T The expected type of the payload.
	 * @param token The JWT token to be decoded.
	 * @returns A promise that resolves to the decoded payload of type T.
	 * @throws InvalidJWTException if the token is invalid or expired.
	 */
	decodeToken<T>(token: string): Promise<T>;
}
