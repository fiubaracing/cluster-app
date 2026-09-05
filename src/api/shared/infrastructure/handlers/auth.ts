import { ApiHandler } from "../../types/api";
import context from "../config/store";
import { InvalidJWTException } from "@/api/auth/infrastructure/exceptions/invalid-jwt.exception";
import { ApiRequest } from "@/api/shared/types/api";
import { CreateContextUseCase } from "@/api/auth/application/usecases/create-context.usecase";

interface AuthMiddlewareDependencies {
    createContextUseCase?: CreateContextUseCase;
}

export function withAuth(handler: ApiHandler, deps?: AuthMiddlewareDependencies) {
    const createContextUseCase: CreateContextUseCase = deps?.createContextUseCase ?? new CreateContextUseCase();
 
    const createContext = async (req: ApiRequest): Promise<void> => {
        const accessToken = req.cookies.get('accessToken')?.value;
        if (!accessToken) {
            throw InvalidJWTException.fromBlank();
        }

        createContextUseCase.execute(accessToken);
    }

    return async function (this: unknown, req: ApiRequest, ...args: any[]) {
        await createContext(req);
        
        return await context.run(async () => {
            return await handler.call(this, req, ...args);
        });
    };
}