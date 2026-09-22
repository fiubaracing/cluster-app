import type { Permissions } from "@/api/roles/domain/models/permissions.model";
import { PermissionsResponseMapper } from "@/api/roles/presentation/mappers/permissions-response.mapper";
import { Paginated } from "@/api/shared/domain/models/paginated.model";
import type {
  User,
  UserWithRolesPermissionsAndTeams,
} from "@/api/users/domain/models/user.model";
import { MeResponse } from "@/api/users/presentation/dtos/responses/me.response";
import { UserResponse } from "@/api/users/presentation/dtos/responses/user.response";

export class UserResponseMapper {
  static toMeResponse(user: UserWithRolesPermissionsAndTeams): MeResponse {
    const response = new MeResponse();
    response.uuid = user.uuid;
    response.email = user.email;
    response.name = user.name;
    response.roles = user.roles;
    response.permissions = PermissionsResponseMapper.toResponse(
      user.permissions as Permissions,
    );
    response.teams = user.teams;
    return response;
  }

  static toUserResponse(user: User): UserResponse {
    const response = new UserResponse();
    response.uuid = user.uuid;
    response.email = user.email;
    response.name = user.name;
    return response;
  }

  static toUserPaginatedResponse(
    users: Paginated<User>,
  ): Paginated<UserResponse> {
    const response = new Paginated<UserResponse>();
    response.data = users.data.map((user) =>
      UserResponseMapper.toUserResponse(user),
    );
    response.page = users.page;
    response.limit = users.limit;
    response.total = users.total;
    return response;
  }
}
