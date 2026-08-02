import { GoogleOAuthRepository } from "@/api/auth/domain/repositories/google-oauth.repository";
import { GoogleOAuthResponseMapper } from "./mappers/google-oauth-response.mapper";
import { GoogleResponse } from "@/api/auth/domain/models/google-response";

export class GoogleOAuthRepositoryImpl implements GoogleOAuthRepository {
    async validateAccessToken(token: string): Promise<GoogleResponse> {
        const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!userInfoResponse.ok) {
            throw new Error(`Failed to validate Google access token: ${userInfoResponse.statusText}`);
        }
        
        const payload = await userInfoResponse.json();
        return GoogleOAuthResponseMapper.toDomain(payload);
    }
}