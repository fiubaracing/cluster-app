import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	rolePermissionsInCore: {
		modulesInCore: r.one.modulesInCore({
			from: r.rolePermissionsInCore.moduleId,
			to: r.modulesInCore.id
		}),
		permissionsInCore: r.one.permissionsInCore({
			from: r.rolePermissionsInCore.permissionId,
			to: r.permissionsInCore.id
		}),
		rolesInCore: r.one.rolesInCore({
			from: r.rolePermissionsInCore.roleId,
			to: r.rolesInCore.id
		}),
	},
	modulesInCore: {
		rolePermissionsInCores: r.many.rolePermissionsInCore(),
	},
	permissionsInCore: {
		rolePermissionsInCores: r.many.rolePermissionsInCore(),
	},
	rolesInCore: {
		rolePermissionsInCores: r.many.rolePermissionsInCore(),
		userRolesInCores: r.many.userRolesInCore(),
	},
	userResourceLimitsInCore: {
		usersInCore: r.one.usersInCore({
			from: r.userResourceLimitsInCore.userId,
			to: r.usersInCore.id
		}),
	},
	usersInCore: {
		userResourceLimitsInCores: r.many.userResourceLimitsInCore(),
		userRolesInCoresCreatedBy: r.many.userRolesInCore({
			alias: "userRolesInCore_createdBy_usersInCore_id"
		}),
		userRolesInCoresDeactivatedBy: r.many.userRolesInCore({
			alias: "userRolesInCore_deactivatedBy_usersInCore_id"
		}),
		userRolesInCoresUpdatedBy: r.many.userRolesInCore({
			alias: "userRolesInCore_updatedBy_usersInCore_id"
		}),
		userRolesInCoresUserId: r.many.userRolesInCore({
			alias: "userRolesInCore_userId_usersInCore_id"
		}),
		usersInCoreCreatedBy: r.one.usersInCore({
			from: r.usersInCore.createdBy,
			to: r.usersInCore.id,
			alias: "usersInCore_createdBy_usersInCore_id"
		}),
		usersInCoresCreatedBy: r.many.usersInCore({
			alias: "usersInCore_createdBy_usersInCore_id"
		}),
		usersInCoreDeactivatedBy: r.one.usersInCore({
			from: r.usersInCore.deactivatedBy,
			to: r.usersInCore.id,
			alias: "usersInCore_deactivatedBy_usersInCore_id"
		}),
		usersInCoresDeactivatedBy: r.many.usersInCore({
			alias: "usersInCore_deactivatedBy_usersInCore_id"
		}),
		usersInCoreUpdatedBy: r.one.usersInCore({
			from: r.usersInCore.updatedBy,
			to: r.usersInCore.id,
			alias: "usersInCore_updatedBy_usersInCore_id"
		}),
		usersInCoresUpdatedBy: r.many.usersInCore({
			alias: "usersInCore_updatedBy_usersInCore_id"
		}),
	},
	userRolesInCore: {
		usersInCoreCreatedBy: r.one.usersInCore({
			from: r.userRolesInCore.createdBy,
			to: r.usersInCore.id,
			alias: "userRolesInCore_createdBy_usersInCore_id"
		}),
		usersInCoreDeactivatedBy: r.one.usersInCore({
			from: r.userRolesInCore.deactivatedBy,
			to: r.usersInCore.id,
			alias: "userRolesInCore_deactivatedBy_usersInCore_id"
		}),
		rolesInCore: r.one.rolesInCore({
			from: r.userRolesInCore.roleId,
			to: r.rolesInCore.id
		}),
		usersInCoreUpdatedBy: r.one.usersInCore({
			from: r.userRolesInCore.updatedBy,
			to: r.usersInCore.id,
			alias: "userRolesInCore_updatedBy_usersInCore_id"
		}),
		usersInCoreUserId: r.one.usersInCore({
			from: r.userRolesInCore.userId,
			to: r.usersInCore.id,
			alias: "userRolesInCore_userId_usersInCore_id"
		}),
	},
}))