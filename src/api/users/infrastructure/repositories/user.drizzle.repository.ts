import { db } from "@/api/shared/infrastructure/config/db";
import { modulesInCore, permissionsInCore, rolePermissionsInCore, rolesInCore, userRolesInCore, usersInCore } from "@/db/migrations/schema";
import { UserEntity, UserEntityWithRolesAndPermissions } from "@/api/users/infrastructure/entities/user.entity";
import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { and, eq } from "drizzle-orm";
import { RoleType } from "@/api/roles/domain/models/role.model";
import { Module } from "@/api/roles/domain/models/module.model";
import { Permission } from "@/api/roles/domain/models/permission.model";

export class UserDrizzleRepository {
	static async findShallowByEmailAndState(
		email: string,
		state: ActiveStateType,
	): Promise<UserEntity | null> {
		return await db
			.select()
			.from(usersInCore)
			.where(
				and(eq(usersInCore.email, email), eq(usersInCore.state, state)),
			)
			.limit(1)
			.then((result) => {
				return result.length === 0 ? null : (result[0] as UserEntity);
			});
	}

	static async findByUuidAndState(
		uuid: string,
		state: ActiveStateType,
	): Promise<UserEntity | null> {
		return await db
			.select()
			.from(usersInCore)
			.where(
				and(eq(usersInCore.uuid, uuid), eq(usersInCore.state, state)),
			)
			.limit(1)
			.then((result) => {
				return result.length === 0 ? null : (result[0] as UserEntity);
			});
	}

	static async findByUuidAndStateWithRolesAndPermissions(uuid: string, state: ActiveStateType): Promise<UserEntityWithRolesAndPermissions | null> {
		const rows = await db
			.select({
				user: usersInCore,
				roleName: rolesInCore.name,
				moduleName: modulesInCore.name,
				permissionName: permissionsInCore.name,
			})
			.from(usersInCore)
			.leftJoin(
				userRolesInCore,
				eq(usersInCore.id, userRolesInCore.userId),
			)
			.leftJoin(rolesInCore, eq(userRolesInCore.roleId, rolesInCore.id))
			.leftJoin(
				rolePermissionsInCore,
				eq(rolesInCore.id, rolePermissionsInCore.roleId),
			)
			.leftJoin(
				permissionsInCore,
				eq(rolePermissionsInCore.permissionId, permissionsInCore.id),
			)
			.leftJoin(
				modulesInCore,
				eq(rolePermissionsInCore.moduleId, modulesInCore.id),
			)
			.where(
				and(eq(usersInCore.uuid, uuid), eq(usersInCore.state, state)),
			);

		if (rows.length === 0) {
			return null;
		}

		const user = rows[0].user as UserEntity;
		const roles = new Set<RoleType>();
		const permissions = new Map<Module, Set<Permission>>();

		for (const row of rows) {
			if (row.roleName) {
				roles.add(row.roleName as RoleType);
			}

			if (row.moduleName && row.permissionName) {
				if (!permissions.has(row.moduleName as Module)) {
					permissions.set(row.moduleName as Module, new Set<Permission>());
				}

				permissions.get(row.moduleName as Module)!.add(row.permissionName as Permission);
			}
		}

		return {
			...user,
			roles,
			permissions,
		};
	}
}
