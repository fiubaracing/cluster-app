import type { UUID } from "crypto";
import {
  aliasedTable,
  and,
  eq,
  exists,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import type { Module } from "@/api/roles/domain/models/module.model";
import type { Permission } from "@/api/roles/domain/models/permission.model";
import type { RoleType } from "@/api/roles/domain/models/role.model";
import type { RoleEntity } from "@/api/roles/infrastructure/entities/role.entity";
import {
  ActiveState,
  type ActiveStateType,
} from "@/api/shared/domain/enums/active-state";
import type { Paginated } from "@/api/shared/domain/models/paginated.model";
import { db } from "@/api/shared/infrastructure/config/db";
import context from "@/api/shared/infrastructure/config/store";
import { DrizzleRepository } from "@/api/shared/infrastructure/repositories/drizzle.repository";
import type { TeamEntity } from "@/api/teams/infrastructure/entities/team.entity";
import type {
  UserEntity,
  UserEntityWithCreator,
  UserEntityWithRoles,
  UserEntityWithRolesPermissionsAndTeams,
  UserEntityWithTeams,
} from "@/api/users/infrastructure/entities/user.entity";
import {
  modulesInCore,
  permissionsInCore,
  rolePermissionsInCore,
  rolesInCore,
  teamsInCore,
  userRolesInCore,
  usersInCore,
  userTeamsInCore,
} from "@/db/migrations/schema";
import type { FindAllUsersDTO } from "../../application/dtos/find-all-users.dto";

const creator = aliasedTable(usersInCore, "creator");

export class UserDrizzleRepository extends DrizzleRepository {
  static async findShallowByEmailAndState(
    email: string,
    state: ActiveStateType,
  ): Promise<UserEntity | null> {
    return await db
      .select()
      .from(usersInCore)
      .where(and(eq(usersInCore.email, email), eq(usersInCore.state, state)))
      .limit(1)
      .then((result) => {
        return result.length === 0 ? null : (result[0] as UserEntity);
      });
  }

  static async findShallowByEmailAndStateWithCreator(
    email: string,
    state: ActiveStateType,
  ): Promise<UserEntityWithCreator | null> {
    return await db
      .select({
        ...usersInCore._.columns,
        createdBy: creator._.columns,
      })
      .from(usersInCore)
      .where(and(eq(usersInCore.email, email), eq(usersInCore.state, state)))
      .leftJoin(creator, eq(usersInCore.createdBy, creator.id))
      .limit(1)
      .then((result) => {
        return result.length === 0
          ? null
          : (result[0] as UserEntityWithCreator);
      });
  }

  static async findByUuidAndState(
    uuid: UUID,
    state: ActiveStateType,
  ): Promise<UserEntity | null> {
    return await db
      .select()
      .from(usersInCore)
      .where(and(eq(usersInCore.uuid, uuid), eq(usersInCore.state, state)))
      .limit(1)
      .then((result) => {
        return result.length === 0 ? null : (result[0] as UserEntity);
      });
  }

  static async findByUuidAndStateWithCreator(
    uuid: UUID,
    state: ActiveStateType,
  ): Promise<UserEntityWithCreator | null> {
    return await db
      .select({
        ...usersInCore._.columns,
        createdBy: creator._.columns,
      })
      .from(usersInCore)
      .where(and(eq(usersInCore.uuid, uuid), eq(usersInCore.state, state)))
      .leftJoin(creator, eq(usersInCore.createdBy, creator.id))
      .limit(1)
      .then((result) => {
        return result.length === 0
          ? null
          : (result[0] as UserEntityWithCreator);
      });
  }

  static async findByUuidAndStateWithAssignedRoles(
    uuid: UUID,
    state: ActiveStateType,
  ): Promise<UserEntityWithRoles | null> {
    const rows = await db
      .select({
        user: usersInCore,
        roles: rolesInCore,
      })
      .from(usersInCore)
      .leftJoin(userRolesInCore, eq(usersInCore.id, userRolesInCore.userId))
      .leftJoin(rolesInCore, eq(userRolesInCore.roleId, rolesInCore.id))
      .where(and(eq(usersInCore.uuid, uuid), eq(usersInCore.state, state)));

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0].user as UserEntity;
    const roles = rows
      .map((row) => row.roles as RoleEntity)
      .filter((role) => role !== null);

    return {
      ...user,
      roles,
    };
  }

  static async findByUuidAndStateWithAssignedTeams(
    uuid: UUID,
    state: ActiveStateType,
  ): Promise<UserEntityWithTeams | null> {
    const rows = await db
      .select({
        user: usersInCore,
        team: teamsInCore,
      })
      .from(usersInCore)
      .leftJoin(userTeamsInCore, eq(usersInCore.id, userTeamsInCore.userId))
      .leftJoin(teamsInCore, eq(userTeamsInCore.teamId, teamsInCore.id))
      .where(and(eq(usersInCore.uuid, uuid), eq(usersInCore.state, state)));

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0].user as UserEntity;
    const teams = rows
      .map((row) => row.team as TeamEntity)
      .filter((team) => team !== null);

    return {
      ...user,
      teams,
    };
  }

  static async findByUuidAndStateWithRolesPermissionsAndTeams(
    uuid: UUID,
    state: ActiveStateType,
  ): Promise<UserEntityWithRolesPermissionsAndTeams | null> {
    const rows = await db
      .select({
        user: usersInCore,
        teamUuid: teamsInCore.uuid,
        roleName: rolesInCore.name,
        moduleName: modulesInCore.name,
        permissionName: permissionsInCore.name,
      })
      .from(usersInCore)
      .leftJoin(userRolesInCore, eq(usersInCore.id, userRolesInCore.userId))
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
      .leftJoin(teamsInCore, eq(userTeamsInCore.teamId, teamsInCore.id))
      .leftJoin(userTeamsInCore, eq(usersInCore.id, userTeamsInCore.userId))
      .where(
        and(
          eq(usersInCore.uuid, uuid),
          eq(usersInCore.state, state),
          eq(userTeamsInCore.state, state),
          eq(userRolesInCore.state, state),
        ),
      );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0].user as UserEntity;
    const roles = new Set<RoleType>();
    const permissions = new Map<Module, Set<Permission>>();
    const teams = new Set<string>();

    for (const row of rows) {
      if (row.roleName) {
        roles.add(row.roleName as RoleType);
      }

      if (row.moduleName && row.permissionName) {
        if (!permissions.has(row.moduleName as Module)) {
          permissions.set(row.moduleName as Module, new Set<Permission>());
        }

        permissions
          .get(row.moduleName as Module)!
          .add(row.permissionName as Permission);
      }

      if (row.teamUuid) {
        teams.add(row.teamUuid);
      }
    }

    return {
      ...user,
      roles,
      permissions,
      teams,
    };
  }

  static async create(user: UserEntity): Promise<UserEntity> {
    const [createdUser] = await db.insert(usersInCore).values(user).returning();
    return createdUser as UserEntity;
  }

  static async update(user: UserEntity): Promise<UserEntity> {
    const [updatedUser] = await db
      .update(usersInCore)
      .set(user)
      .where(eq(usersInCore.uuid, user.uuid))
      .returning();
    return updatedUser as UserEntity;
  }

  static async findUserInContext(): Promise<UserEntity | null> {
    return await db
      .select()
      .from(usersInCore)
      .where(
        and(
          eq(usersInCore.uuid, context.store.user.uuid),
          eq(usersInCore.state, ActiveState.ACTIVE),
        ),
      )
      .limit(1)
      .then((result) => {
        return result.length === 0 ? null : (result[0] as UserEntity);
      });
  }

  static async unassignRolesIn(
    userId: number,
    roleIds: number[],
    now: Date,
    currentUser: UserEntity,
  ): Promise<void> {
    await db
      .update(userRolesInCore)
      .set({
        state: ActiveState.INACTIVE,
        updatedAt: now,
        updatedBy: currentUser.id,
        deactivatedAt: now,
        deactivatedBy: currentUser.id,
      })
      .where(
        and(
          eq(userRolesInCore.userId, userId),
          eq(userRolesInCore.state, ActiveState.ACTIVE),
          inArray(userRolesInCore.roleId, roleIds),
        ),
      );
  }

  static async assignRolesIn(
    userId: number,
    roleIds: number[],
    now: Date,
    currentUser: UserEntity,
  ): Promise<void> {
    await db.insert(userRolesInCore).values(
      roleIds.map((roleId) => ({
        userId,
        roleId,
        state: ActiveState.ACTIVE,
        createdAt: now,
        createdBy: currentUser.id,
        updatedAt: now,
        updatedBy: currentUser.id,
      })),
    );
  }

  static async replaceRolesInTransaction(
    userId: number,
    roleIdsToAdd: number[],
    roleIdsToRemove: number[],
    now: Date,
    currentUser: UserEntity,
  ): Promise<void> {
    return await db.transaction(async (trx) => {
      if (roleIdsToRemove.length > 0) {
        await UserDrizzleRepository.unassignRolesIn(
          userId,
          roleIdsToRemove,
          now,
          currentUser,
        );
      }

      if (roleIdsToAdd.length > 0) {
        await UserDrizzleRepository.assignRolesIn(
          userId,
          roleIdsToAdd,
          now,
          currentUser,
        );
      }
    });
  }

  static async unassignTeamsIn(
    userId: number,
    teamIds: number[],
    now: Date,
    currentUser: UserEntity,
  ): Promise<void> {
    await db
      .update(userTeamsInCore)
      .set({
        state: ActiveState.INACTIVE,
        updatedAt: now,
        updatedBy: currentUser.id,
        deactivatedAt: now,
        deactivatedBy: currentUser.id,
      })
      .where(
        and(
          eq(userTeamsInCore.userId, userId),
          eq(userTeamsInCore.state, ActiveState.ACTIVE),
          inArray(userTeamsInCore.teamId, teamIds),
        ),
      );
  }

  static async assignTeamsIn(
    userId: number,
    teamIds: number[],
    now: Date,
    currentUser: UserEntity,
  ): Promise<void> {
    await db.insert(userTeamsInCore).values(
      teamIds.map((teamId) => ({
        userId,
        teamId,
        state: ActiveState.ACTIVE,
        createdAt: now,
        createdBy: currentUser.id,
        updatedAt: now,
        updatedBy: currentUser.id,
      })),
    );
  }

  static async replaceTeamsInTransaction(
    userId: number,
    teamIdsToAdd: number[],
    teamIdsToRemove: number[],
    now: Date,
    currentUser: UserEntity,
  ): Promise<void> {
    return await db.transaction(async (trx) => {
      if (teamIdsToRemove.length > 0) {
        await UserDrizzleRepository.unassignTeamsIn(
          userId,
          teamIdsToRemove,
          now,
          currentUser,
        );
      }

      if (teamIdsToAdd.length > 0) {
        await UserDrizzleRepository.assignTeamsIn(
          userId,
          teamIdsToAdd,
          now,
          currentUser,
        );
      }
    });
  }

  static async findAllUsers(
    dto: FindAllUsersDTO,
  ): Promise<Paginated<UserEntity>> {
    const where = and(
      UserDrizzleRepository.toDataScopeClause(dto.dataScope, {
        createdBy: usersInCore.createdBy,
        inTeams: (teamUuids) =>
          exists(
            db
              .select({ id: userTeamsInCore.userId })
              .from(userTeamsInCore)
              .innerJoin(
                teamsInCore,
                eq(userTeamsInCore.teamId, teamsInCore.id),
              )
              .where(
                and(
                  eq(userTeamsInCore.userId, usersInCore.id),
                  inArray(teamsInCore.uuid, teamUuids),
                ),
              ),
          ),
      }),
      UserDrizzleRepository.toSearchClause(dto.search),
    );

    const [rows, total] = await Promise.all([
      db
        .select()
        .from(usersInCore)
        .where(where)
        .orderBy(...UserDrizzleRepository.toOrderByClause(dto, usersInCore))
        .limit(dto.limit)
        .offset(dto.page * dto.limit),
      db.$count(usersInCore, where),
    ]);

    return {
      data: rows as UserEntity[],
      page: dto.page,
      limit: dto.limit,
      total,
    } as Paginated<UserEntity>;
  }

  private static toSearchClause(search?: string): SQL | undefined {
    if (!search) return undefined;
    const pattern = `%${UserDrizzleRepository.escapeLikePattern(search)}%`;
    return or(
      ilike(usersInCore.email, pattern),
      ilike(usersInCore.name, pattern),
    );
  }
}
