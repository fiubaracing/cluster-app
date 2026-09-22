import type { UUID } from "crypto";
import type { Module } from "@/api/roles/domain/models/module.model";
import type { Permission } from "@/api/roles/domain/models/permission.model";
import type { RoleType } from "@/api/roles/domain/models/role.model";
import type { RoleEntity } from "@/api/roles/infrastructure/entities/role.entity";
import type { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import type { TeamEntity } from "@/api/teams/infrastructure/entities/team.entity";

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

export type UserEntityWithRoles = UserEntity & {
  roles: RoleEntity[];
};

export type UserEntityWithTeams = UserEntity & {
  teams: TeamEntity[];
};
