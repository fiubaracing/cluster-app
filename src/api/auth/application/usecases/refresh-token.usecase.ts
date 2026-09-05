import { JWTRepository } from "@/api/auth/domain/repositories/jwt.repository";
import { JWTRepositoryImpl } from "@/api/auth/infrastructure/adapters/jwt.repository-impl";
import { RefreshTokenPayload } from "@/api/auth/domain/models/refresh-token-payload";
import { FindShallowUserByUuidUseCase } from "@/api/users/application/usecases/find-shallow-user-by-uuid.usecase";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { GenerateTokensUseCase } from "./generate-tokens.usecase";
import { Auth } from "../../domain/models/auth";
import { deleteCached, getCached } from "@/api/shared/infrastructure/config/redis";
import { InvalidJWTException } from "../../infrastructure/exceptions/invalid-jwt.exception";


interface RefreshTokenUseCaseDependencies {
    jwtRepository?: JWTRepository;
    findShallowUserByUuidUseCase?: FindShallowUserByUuidUseCase;
    generateTokensUseCase?: GenerateTokensUseCase;
}

export class RefreshTokenUseCase {
    private readonly jwtRepository: JWTRepository;
    private readonly findShallowUserByUuidUseCase: FindShallowUserByUuidUseCase;
    private readonly generateTokensUseCase: GenerateTokensUseCase;

    constructor(deps?: RefreshTokenUseCaseDependencies) {
        this.jwtRepository = deps?.jwtRepository ?? new JWTRepositoryImpl();
        this.findShallowUserByUuidUseCase = deps?.findShallowUserByUuidUseCase ?? new FindShallowUserByUuidUseCase();
        this.generateTokensUseCase = deps?.generateTokensUseCase ?? new GenerateTokensUseCase();
    }

    /**
     * Executes the use case to refresh an access token using a provided refresh token.
     * @param refreshToken - The refresh token used to generate a new access token.
     * @returns A promise that resolves to the new access token as a string.
     * @throws {UserNotFoundException} if the user associated with the refresh token is not found.
     * @throws {InvalidJWTException} if the provided refresh token is invalid or cannot be decoded.
     */
    public async execute(refreshToken: string): Promise<Auth> {
        logger.info("Use case RefreshTokenUseCase started");
        const { uuid, sessionId }: RefreshTokenPayload = await this.jwtRepository.decodeToken(refreshToken);

        const oldToken = await getCached(`session:${uuid}:${sessionId}`);
        
        if (!oldToken) {
            throw InvalidJWTException.fromExpired();
        }

        if (oldToken !== refreshToken) {
            await deleteCached(`session:${uuid}:${sessionId}`);
            throw InvalidJWTException.fromExpired();
        }

        const user = await this.findShallowUserByUuidUseCase.execute(uuid);
        const auth = await this.generateTokensUseCase.execute(user, sessionId);

        logger.info("Use case RefreshTokenUseCase completed successfully");
        return auth;
    }
}
