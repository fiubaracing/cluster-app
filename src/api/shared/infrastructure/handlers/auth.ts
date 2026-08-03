import { ApiHandler } from "../../types/api";
import { emailStorage } from "../config/logger";
import { InvalidJWTException } from "@/api/auth/infrastructure/exceptions/invalid-jwt.exception";
import { JWTRepository } from "@/api/auth/domain/repositories/jwt.repository";
import { JWTRepositoryImpl } from "@/api/auth/infrastructure/adapters/jwt.repository-impl";
import { AccessTokenPayload } from "@/api/auth/domain/models/access-token-payload";
import { ApiRequest } from "@/api/shared/types/api";

interface AuthMiddlewareDependencies {
    jwtRepository?: JWTRepository;
}

export function withAuth(handler: ApiHandler, deps?: AuthMiddlewareDependencies) {
    const jwtRepository: JWTRepository = deps?.jwtRepository ?? new JWTRepositoryImpl();
 
    const extractEmailFromAuth = async (req: ApiRequest): Promise<string> => {
        const accessToken = req.cookies.get('accessToken')?.value;
        if (!accessToken) {
            throw InvalidJWTException.fromBlank();
        }

        const payload = await jwtRepository.decodeToken<AccessTokenPayload>(accessToken);

        req.context = payload;

        return payload.email;
    }

    return async function (this: unknown, req: ApiRequest, ...args: any[]) {
        const authEmail = await extractEmailFromAuth(req);
        
        return await emailStorage.run(authEmail, async () => {
            return await handler.call(this, req, ...args);
        });
    };
}