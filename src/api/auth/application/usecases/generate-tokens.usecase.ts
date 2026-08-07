import { JWTRepository } from "@/api/auth/domain/repositories/jwt.repository";
import { JWTRepositoryImpl } from "@/api/auth/infrastructure/adapters/jwt.repository-impl";
import { AccessTokenPayload } from "@/api/auth/domain/models/access-token-payload";
import { Auth } from "@/api/auth/domain/models/auth";
import { User } from "@/api/users/domain/models/user.model";
import { RefreshTokenPayload } from "@/api/auth/domain/models/refresh-token-payload";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, REFRESH_TOKEN_TTL_SECONDS } from "@/api/shared/infrastructure/consts/token-ttl";
import { setCache } from "@/api/shared/infrastructure/config/redis";

interface GenerateTokensUseCaseDependencies {
    jwtRepository?: JWTRepository;
}

export class GenerateTokensUseCase {
    private readonly jwtRepository: JWTRepository;
    
    constructor(deps?: GenerateTokensUseCaseDependencies) {
        this.jwtRepository = deps?.jwtRepository ?? new JWTRepositoryImpl();
    }

    /**
     * Executes the use case to generate access and refresh tokens for a given user.
     * @param user - The user for whom the tokens are to be generated.
     * @param existingSessionId - Optional existing session ID to be used for the refresh token. If not provided, a new session ID will be generated.
     * @returns A promise that resolves to an Auth object containing the generated access and refresh tokens.
     */
    public async execute(user: User, existingSessionId?: string): Promise<Auth> {
        const accessPayload: AccessTokenPayload = {
            uuid: user.uuid,
            email: user.email,
            name: user.name,
        };

        const refreshPayload: RefreshTokenPayload = {
            uuid: user.uuid,
            sessionId: existingSessionId ?? crypto.randomUUID(),
        };

        const accessToken = await this.jwtRepository.signToken(
            accessPayload,
            ACCESS_TOKEN_TTL,
        );

        const refreshToken = await this.jwtRepository.signToken(
            refreshPayload,
            REFRESH_TOKEN_TTL,
        );

        setCache(`session:${refreshPayload.uuid}:${refreshPayload.sessionId}`, refreshToken, REFRESH_TOKEN_TTL_SECONDS);

        return new Auth(accessToken, refreshToken);
    }
}