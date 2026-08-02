import { GoogleResponse } from "@/api/auth/domain/models/google-response";

export interface GoogleOAuthRepository {
    validateAccessToken(token: string): Promise<GoogleResponse>;
}
