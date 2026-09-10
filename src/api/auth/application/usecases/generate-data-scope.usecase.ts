import { FindUserInContextUseCase } from "@/api/users/application/usecases/find-user-in-context.usecase";
import { UserWithRolesPermissionsAndTeams } from "@/api/users/domain/models/user.model";
import { DataScope } from "@/api/auth/domain/models/data-scope";
import { Module } from "@/api/roles/domain/models/module.model";
import { PermissionEnum } from "@/api/roles/domain/models/permission.model";
import { logger } from "@/api/shared/infrastructure/config/logger";

interface GenerateDataScopeUseCaseDependencies {
	findUserInContextUseCase?: FindUserInContextUseCase;
}

export class GenerateDataScopeUseCase {
	private readonly findUserInContextUseCase: FindUserInContextUseCase;

	constructor(deps?: GenerateDataScopeUseCaseDependencies) {
		this.findUserInContextUseCase =
			deps?.findUserInContextUseCase ?? new FindUserInContextUseCase();
	}

	/**
	 * Generates an data scope based on the current user's context and the provided validation data.
	 * @param module - The module for which the data scope is being generated.
	 * @returns A promise that resolves to the generated data scope.
	 */
	public async execute(module: Module): Promise<DataScope> {
		logger.info(`Use case GenerateDataScopeUseCase started`);

		const user: UserWithRolesPermissionsAndTeams | null =
			await this.findUserInContextUseCase.execute();
		if (!user) {
			throw new Error("User not found in context");
		}

		const dataScope = new DataScope();
		dataScope.isGlobal = user.permissions.has(
			module,
			PermissionEnum.GLOBAL_READ,
		);
		dataScope.ownerUuid =
			user.permissions.has(module, PermissionEnum.OWN_READ) ?
				user.uuid
			:	null;
		dataScope.teamUuids =
			user.permissions.has(module, PermissionEnum.TEAM_READ) ?
				Array.from(user.teams)
			:	null;

		logger.info(
			"Use case GenerateDataScopeUseCase completed successfully",
		);
		return dataScope;
	}
}
