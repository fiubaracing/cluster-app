import { JWTRepository } from "@/api/auth/domain/repositories/jwt.repository";
import { JWTRepositoryImpl } from "@/api/auth/infrastructure/adapters/jwt.repository-impl";
import { RefreshTokenPayload } from "@/api/auth/domain/models/refresh-token-payload";
import { FindShallowUserByUuidUseCase } from "@/api/users/application/usecases/find-shallow-user-by-uuid.usecase";
import { AccessTokenPayload } from "@/api/auth/domain/models/access-token-payload";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { ACCESS_TOKEN_TTL } from "@/api/shared/infrastructure/consts/token-ttl";


interface RefreshTokenUseCaseDependencies {
    jwtRepository?: JWTRepository;
    findShallowUserByUuidUseCase?: FindShallowUserByUuidUseCase;
}

export class RefreshTokenUseCase {
    private readonly jwtRepository: JWTRepository;
    private readonly findShallowUserByUuidUseCase: FindShallowUserByUuidUseCase;

    constructor(deps?: RefreshTokenUseCaseDependencies) {
        this.jwtRepository = deps?.jwtRepository ?? new JWTRepositoryImpl();
        this.findShallowUserByUuidUseCase = deps?.findShallowUserByUuidUseCase ?? new FindShallowUserByUuidUseCase();
    }

    /**
     * Executes the use case to refresh an access token using a provided refresh token.
     * @param refreshToken - The refresh token used to generate a new access token.
     * @returns A promise that resolves to the new access token as a string.
     * @throws {UserNotFoundException} if the user associated with the refresh token is not found.
     * @throws {InvalidJWTException} if the provided refresh token is invalid or cannot be decoded.
     */
    public async execute(refreshToken: string): Promise<string> {
        logger.info("Use case RefreshTokenUseCase started");
        const { uuid }: RefreshTokenPayload = await this.jwtRepository.decodeToken(refreshToken);

        const newAccessToken = await this.signNewAccessToken(uuid);
        
        logger.info("Use case RefreshTokenUseCase completed successfully");
        return newAccessToken;
    }
    
    private async signNewAccessToken(userUuid: string): Promise<string> {
        const user = await this.findShallowUserByUuidUseCase.execute(userUuid);
        const payload: AccessTokenPayload = {
            uuid: user.uuid,
            email: user.email,
            name: user.name,
        };
        
        return await this.jwtRepository.signToken(payload, ACCESS_TOKEN_TTL);
    }
}
