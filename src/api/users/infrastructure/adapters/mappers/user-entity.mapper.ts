import type { UUID } from "crypto";
import { Permissions } from "@/api/roles/domain/models/permissions.model";
import type { Paginated } from "@/api/shared/domain/models/paginated.model";
import {
  User,
  type UserWithCreator,
  UserWithRolesPermissionsAndTeams,
} from "@/api/users/domain/models/user.model";
import type {
  UserEntity,
  UserEntityWithCreator,
  UserEntityWithRolesPermissionsAndTeams,
} from "@/api/users/infrastructure/entities/user.entity";

export class UserEntityMapper {
  static toDomainShallow(entity: UserEntity | null): User | null {
    if (!entity) {
      return null;
    }

    const user = new User();
    user.uuid = entity.uuid;
    user.email = entity.email;
    user.name = entity.name;
    return user;
  }

  static toDomainWithRolesPermissionsAndTeams(
    entity: UserEntityWithRolesPermissionsAndTeams | null,
  ): UserWithRolesPermissionsAndTeams | null {
    if (!entity) {
      return null;
    }

    const user = new UserWithRolesPermissionsAndTeams();
    user.uuid = entity.uuid;
    user.email = entity.email;
    user.name = entity.name;
    user.roles = entity.roles;
    user.permissions = new Permissions(entity.permissions);
    user.teams = entity.teams as Set<UUID>;
    return user;
  }

  static toDomainShallowWithCreator(
    entity: UserEntityWithCreator | null,
  ): UserWithCreator | null {
    if (!entity) {
      return null;
    }

    const user = new User();
    user.uuid = entity.uuid;
    user.email = entity.email;
    user.name = entity.name;

    const creatorEntity = UserEntityMapper.toDomainShallow(entity.createdBy);

    return {
      ...user,
      createdBy: creatorEntity,
    };
  }

  static toDomainShallowPaginated(
    entity: Paginated<UserEntity>,
  ): Paginated<User> {
    return {
      ...entity,
      data: entity.data.map(
        (user) => UserEntityMapper.toDomainShallow(user) as User,
      ),
    };
  }
}
