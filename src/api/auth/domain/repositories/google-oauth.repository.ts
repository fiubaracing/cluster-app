import { GoogleResponse } from "@/api/auth/domain/models/google-response";

export interface GoogleOAuthRepository {
    /**
     * Validates the provided Google access token and retrieves the associated user information.
     * @param token - The Google access token to validate.
     * @returns A promise that resolves to a GoogleResponse object containing user information.
     */
    validateAccessToken(token: string): Promise<GoogleResponse>;
}
