import {
	ValidateItemAccessBulkDTO,
	ValidateItemAccessDTO,
} from "../dtos/validate-access.dto";
import context from "@/api/shared/infrastructure/config/store";
import { PermissionSuffix } from "@/api/roles/domain/models/permission.model";
import { Module } from "@/api/roles/domain/models/module.model";
import { ForbiddenException } from "@/api/shared/infrastructure/exceptions/forbidden.exception";

export class ValidateAccessUseCase {
    /**
     * Validates if the current user has access to a specific item based on module, permission, and ownership.
     * @param dto - The data transfer object containing module, permission, and optional ownership information.
     * @throws {ForbiddenException} If the user does not have the required access.
     * @returns A promise that resolves if the user has access, otherwise it throws an exception.
     */
	public async execute(dto: ValidateItemAccessDTO): Promise<void> {
		const hasModulePermission = this.hasModulePermission(dto.module, dto.permission);
        const hasOwnership = dto.ownerUuid ? this.hasOwnership(new Set([dto.ownerUuid])) : true;
        const hasTeamOwnership = dto.ownerTeamUuid ? this.hasTeamOwnership(new Set([dto.ownerTeamUuid])) : true;

        if (!hasModulePermission || !hasOwnership || !hasTeamOwnership) {
            throw new ForbiddenException(
                `Forbidden`,
                `User does not have permission ${dto.permission} for a item in module ${dto.module}`,
            );
        }
	}

    /**
     * Validates if the current user has access to multiple items based on module, permission, and ownership.
     * @param dto - The data transfer object containing module, permission, and optional ownership information for multiple items.
     * @throws {ForbiddenException} If the user does not have the required access for any of the items.
     * @returns A promise that resolves if the user has access to all items, otherwise it throws an exception.
     */
	public async executeBulk(dto: ValidateItemAccessBulkDTO): Promise<void> {
        const hasModulePermission = this.hasModulePermission(dto.module, dto.permission);
        const hasOwnership = dto.ownerUuids ? this.hasOwnership(new Set(dto.ownerUuids)) : true;
        const hasTeamOwnership = dto.ownerTeamUuids ? this.hasTeamOwnership(new Set(dto.ownerTeamUuids)) : true;

        if (!hasModulePermission || !hasOwnership || !hasTeamOwnership) {
            throw new ForbiddenException(
                `Forbidden`,
                `User does not have permission ${dto.permission} for items in module ${dto.module}`,
            );
        }
	}

    private hasModulePermission(module: Module, permission: PermissionSuffix): boolean {
        const permissions = context.store.user.permissions;
        return permissions.hasSuffix(module, permission);
    }

    private hasOwnership(ownerUuid: Set<string>) {
        const userUuid = context.store.user.uuid;
        return ownerUuid.has(userUuid);
    }

    private hasTeamOwnership(ownerTeamUuids: Set<string>) {
        const userTeamUuids = context.store.user.teams;
        return ownerTeamUuids.values().some(teamUuid => userTeamUuids.has(teamUuid));
    }
}
