import type { UUID } from "crypto";
import type { Permissions } from "@/api/roles/domain/models/permissions.model";
import type { RoleType } from "@/api/roles/domain/models/role.model";
import type { ActiveStateType } from "@/api/shared/domain/enums/active-state";

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
  teams!: Set<UUID>;
}

export type UserWithCreator = Omit<User, "createdBy"> & {
  createdBy: User | null;
};
