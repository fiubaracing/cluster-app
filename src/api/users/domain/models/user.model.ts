import { RoleType } from "@/api/roles/domain/models/role.model";
import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { Permissions } from "@/api/roles/domain/models/permissions.model";
import { UUID } from "crypto";

export class User {
	uuid!: UUID;
	email!: string;
	name!: string;
	state?: ActiveStateType;
	createdAt?: Date | null;
	createdBy?: number | null;
	updatedAt?: Date | null;
	updatedBy?: number | null;
	deactivatedAt?: Date | null;
	deactivatedBy?: number | null;
}

export class UserWithRolesPermissionsAndTeams extends User {
	roles!: Set<RoleType>;
	permissions!: Permissions;
	teams!: Set<string>;
}

export type UserWithCreator = Omit<User, "createdBy"> & {
	createdBy: User | null;
};
