import { ApiHandler } from "../../types/api";
import context from "../config/store";
import { Context } from "@/api/shared/infrastructure/config/store";
import { InvalidJWTException } from "@/api/auth/infrastructure/exceptions/invalid-jwt.exception";
import { ApiRequest } from "@/api/shared/types/api";
import { CreateContextUseCase } from "@/api/auth/application/usecases/create/create-context.usecase";

interface AuthMiddlewareDependencies {
	createContextUseCase?: CreateContextUseCase;
}

export function withAuthentication(
	handler: ApiHandler,
	deps?: AuthMiddlewareDependencies,
) {
	const createContextUseCase: CreateContextUseCase =
		deps?.createContextUseCase ?? new CreateContextUseCase();

	const createContext = async (req: ApiRequest): Promise<Context> => {
		const accessToken = req.cookies.get("accessToken")?.value;
		if (!accessToken) {
			throw InvalidJWTException.fromBlank();
		}

		return await createContextUseCase.execute(accessToken);
	};

	return async function (this: unknown, req: ApiRequest, ...args: any[]) {
		const ctx: Context = await createContext(req);

		return await context.run(async () => {
			return await handler.call(this, req, ...args);
		}, ctx);
	};
}
