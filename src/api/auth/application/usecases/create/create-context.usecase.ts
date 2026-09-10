import { JWTRepository } from "@/api/auth/domain/repositories/jwt.repository";
import { JWTRepositoryImpl } from "@/api/auth/infrastructure/adapters/jwt.repository-impl";
import { AccessTokenPayload } from "@/api/auth/domain/models/access-token-payload";
import { Context } from "@/api/shared/infrastructure/config/store";
import { FindUserByUuidWithRolesPermissionsAndTeamsUseCase } from "@/api/users/application/usecases/find/find-user-by-uuid-with-roles-and-permissions.usecase";

interface CreateContextUseCaseDependencies {
	jwtRepository?: JWTRepository;
	findUserByUuidWithRolesAndPermissions?: FindUserByUuidWithRolesPermissionsAndTeamsUseCase;
}

export class CreateContextUseCase {
	private readonly jwtRepository: JWTRepository;
	private readonly findUserByUuidWithRolesAndPermissions: FindUserByUuidWithRolesPermissionsAndTeamsUseCase;

	constructor(deps?: CreateContextUseCaseDependencies) {
		this.jwtRepository = deps?.jwtRepository ?? new JWTRepositoryImpl();
		this.findUserByUuidWithRolesAndPermissions =
			deps?.findUserByUuidWithRolesAndPermissions ??
			new FindUserByUuidWithRolesPermissionsAndTeamsUseCase();
	}

	/**
	 * Executes the use case to generate a context from a given token.
	 * @param token - The token to be used for generating the context.
	 * @returns A promise that resolves to a Context object.
	 */
	public async execute(token: string): Promise<Context> {
		const payload =
			await this.jwtRepository.decodeToken<AccessTokenPayload>(token);
		const user = await this.findUserByUuidWithRolesAndPermissions.execute(
			payload.uuid,
		);
		const traceId = crypto.randomUUID();

		return {
			traceId,
			user,
		};
	}
}
