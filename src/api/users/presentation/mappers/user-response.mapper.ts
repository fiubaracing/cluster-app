import { UserWithRolesPermissionsAndTeams } from "@/api/users/domain/models/user.model";
import { MeResponse } from "@/api/users/presentation/dtos/responses/me.response";
import { PermissionsResponseMapper } from "@/api/roles/presentation/mappers/permissions-response.mapper";
import { Permissions } from "@/api/roles/domain/models/permissions.model";

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
}
