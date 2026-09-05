import { UserEntity, UserEntityWithRolesAndPermissions } from "@/api/users/infrastructure/entities/user.entity";
import { User, UserWithRolesAndPermissions } from "@/api/users/domain/models/user.model";
import { Permissions } from "@/api/roles/domain/models/permissions.model";

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

	static toDomainWithRolesAndPermissions(entity: UserEntityWithRolesAndPermissions | null): UserWithRolesAndPermissions | null {
		if (!entity) {
			return null;
		}

		const user = new UserWithRolesAndPermissions();
		user.uuid = entity.uuid;
		user.email = entity.email;
		user.name = entity.name;
		user.roles = entity.roles;
		user.permissions = new Permissions(entity.permissions);
		return user;
	}
}
