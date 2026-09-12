import { Module } from "@/api/roles/domain/models/module.model";
import { Permission } from "@/api/roles/domain/models/permission.model";
import { RoleType } from "@/api/roles/domain/models/role.model";
import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { UUID } from "@/api/shared/domain/models/uuid";

export class UserEntity {
	id!: number;
	uuid!: UUID;
	email!: string;
	name!: string;
	state!: ActiveStateType;
	createdAt!: Date | null;
	createdBy!: number | null;
	updatedAt!: Date | null;
	updatedBy!: number | null;
	deactivatedAt!: Date | null;
	deactivatedBy!: number | null;
}

export type UserEntityWithRolesPermissionsAndTeams = UserEntity & {
	roles: Set<RoleType>;
	permissions: Map<Module, Set<Permission>>;
	teams: Set<string>;
};

export type UserEntityWithCreator = Omit<UserEntity, "createdBy"> & {
	createdBy: UserEntity | null;
};
