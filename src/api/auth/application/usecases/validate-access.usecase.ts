import {
	ValidateItemAccessBulkDTO,
	ValidateItemAccessDTO,
} from "../dtos/validate-access.dto";
import { PermissionSuffix } from "@/api/roles/domain/models/permission.model";
import { Module } from "@/api/roles/domain/models/module.model";
import { ForbiddenException } from "@/api/shared/infrastructure/exceptions/forbidden.exception";
import { FindUserInContextUseCase } from "@/api/users/application/usecases/find-user-in-context.usecase";
import { UserWithRolesPermissionsAndTeams } from "@/api/users/domain/models/user.model";
import { logger } from "@/api/shared/infrastructure/config/logger";

interface ValidateAccessUseCaseDependencies {
    findUserInContextUseCase?: FindUserInContextUseCase;
}

export class ValidateAccessUseCase {
    private readonly findUserInContextUseCase: FindUserInContextUseCase;

    constructor(deps?: ValidateAccessUseCaseDependencies) {
        this.findUserInContextUseCase = deps?.findUserInContextUseCase ?? new FindUserInContextUseCase();
    }

    /**
     * Validates if the current user has access to a specific item based on module, permission, and ownership.
     * @param dto - The data transfer object containing module, permission, and optional ownership information.
     * @throws {ForbiddenException} If the user does not have the required access.
     * @returns A promise that resolves if the user has access, otherwise it throws an exception.
     */
	public async execute(dto: ValidateItemAccessDTO): Promise<void> {
        logger.info(`Use case ValidateAccessUseCase started`);
        const user: UserWithRolesPermissionsAndTeams | null = await this.findUserInContextUseCase.execute();
        if (!user) {
            throw new Error("User not found in context");
        }

		const hasModulePermission = this.hasModulePermission(user, dto.module, dto.permission);
        const hasOwnership = dto.ownerUuid ? this.hasOwnership(user, new Set([dto.ownerUuid])) : true;
        const hasTeamOwnership = dto.ownerTeamUuid ? this.hasTeamOwnership(user, new Set([dto.ownerTeamUuid])) : true;

        if (!hasModulePermission || !hasOwnership || !hasTeamOwnership) {
            throw new ForbiddenException(
                `Forbidden`,
                `User does not have permission ${dto.permission} for a item in module ${dto.module}`,
            );
        }

        logger.info("Use case ValidateAccessUseCase completed successfully");
	}

    /**
     * Validates if the current user has access to multiple items based on module, permission, and ownership.
     * @param dto - The data transfer object containing module, permission, and optional ownership information for multiple items.
     * @throws {ForbiddenException} If the user does not have the required access for any of the items.
     * @returns A promise that resolves if the user has access to all items, otherwise it throws an exception.
     */
	public async executeBulk(dto: ValidateItemAccessBulkDTO): Promise<void> {
        logger.info(`Use case ValidateAccessUseCase in bulk started`);

        const user: UserWithRolesPermissionsAndTeams | null = await this.findUserInContextUseCase.execute();
        if (!user) {
            throw new Error("User not found in context");
        }

        const hasModulePermission = this.hasModulePermission(user, dto.module, dto.permission);
        const hasOwnership = dto.ownerUuids ? this.hasOwnership(user, new Set(dto.ownerUuids)) : true;
        const hasTeamOwnership = dto.ownerTeamUuids ? this.hasTeamOwnership(user, new Set(dto.ownerTeamUuids)) : true;

        if (!hasModulePermission || !hasOwnership || !hasTeamOwnership) {
            throw new ForbiddenException(
                `Forbidden`,
                `User does not have permission ${dto.permission} for items in module ${dto.module}`,
            );
        }
        logger.info("Use case ValidateAccessUseCase in bulk completed successfully");
	}

    private hasModulePermission(user: UserWithRolesPermissionsAndTeams, module: Module, permission: PermissionSuffix): boolean {
        const permissions = user.permissions;
        return permissions.hasSuffix(module, permission);
    }

    private hasOwnership(user: UserWithRolesPermissionsAndTeams, ownerUuid: Set<string>) {
        const userUuid = user.uuid;
        return ownerUuid.has(userUuid);
    }

    private hasTeamOwnership(user: UserWithRolesPermissionsAndTeams, ownerTeamUuids: Set<string>) {
        const userTeamUuids = user.teams;
        return ownerTeamUuids.values().some(teamUuid => userTeamUuids.has(teamUuid));
    }
}
