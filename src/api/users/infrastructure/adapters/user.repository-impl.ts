import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import {
	ActiveState,
	ActiveStateType,
} from "@/api/shared/domain/enums/active-state";
import { UserDrizzleRepository } from "@/api/users/infrastructure/repositories/user.drizzle.repository";
import { UserEntityMapper } from "@/api/users/infrastructure/adapters/mappers/user-entity.mapper";
import {
	User,
	UserWithCreator,
	UserWithRolesPermissionsAndTeams,
} from "@/api/users/domain/models/user.model";
import { UpsertUserDTO } from "@/api/users/application/dtos/upsert-user.dto";
import { UserEntity } from "@/api/users/infrastructure/entities/user.entity";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UUID } from "crypto";
import { RoleDrizzleRepository } from "@/api/roles/infrastructure/repositories/role.drizzle.repository";

export class UserRepositoryImpl implements UserRepository {
	async findShallowByEmailAndState(
		email: string,
		state: ActiveStateType,
	): Promise<User | null> {
		logger.info(
			`Finding shallow user by email: ${email} and state: ${state}`,
		);

		return UserEntityMapper.toDomainShallow(
			await UserDrizzleRepository.findShallowByEmailAndState(
				email,
				state,
			),
		);
	}

	async findShallowByEmailAndStateWithCreator(
		email: string,
		state: ActiveStateType,
	): Promise<UserWithCreator | null> {
		logger.info(
			`Finding shallow user by email: ${email} and state: ${state} with creator`,
		);

		return UserEntityMapper.toDomainShallowWithCreator(
			await UserDrizzleRepository.findShallowByEmailAndStateWithCreator(
				email,
				state,
			),
		);
	}

	async findShallowByUuidAndState(
		uuid: UUID,
		state: ActiveStateType,
	): Promise<User | null> {
		logger.info(
			`Finding shallow user by uuid: ${uuid} and state: ${state}`,
		);

		return UserEntityMapper.toDomainShallow(
			await UserDrizzleRepository.findByUuidAndState(uuid, state),
		);
	}

	async findShallowByUuidAndStateWithCreator(
		uuid: UUID,
		state: ActiveStateType,
	): Promise<UserWithCreator | null> {
		logger.info(
			`Finding shallow user by uuid: ${uuid} and state: ${state} with creator`,
		);

		return UserEntityMapper.toDomainShallowWithCreator(
			await UserDrizzleRepository.findByUuidAndStateWithCreator(
				uuid,
				state,
			),
		);
	}

	async findByUuidAndStateWithRolesPermissionsAndTeams(
		uuid: UUID,
		state: ActiveStateType,
	): Promise<UserWithRolesPermissionsAndTeams | null> {
		logger.info(
			`Finding user by uuid: ${uuid} and state: ${state} with roles, permissions, and teams`,
		);

		return UserEntityMapper.toDomainWithRolesPermissionsAndTeams(
			await UserDrizzleRepository.findByUuidAndStateWithRolesPermissionsAndTeams(
				uuid,
				state,
			),
		);
	}

	async create(dto: UpsertUserDTO): Promise<User> {
		logger.info(`Creating user: ${dto.email}`);

		const now = new Date();
		const currentUser = await UserDrizzleRepository.findUserInContext();
		if (!currentUser) {
			throw new Error("Current user not found in context");
		}

		const entity = new UserEntity();
		entity.uuid = crypto.randomUUID() as UUID;
		entity.email = dto.email;
		entity.name = dto.name;

		entity.state = ActiveState.ACTIVE;
		entity.createdAt = now;
		entity.createdBy = currentUser.id;
		entity.updatedAt = now;
		entity.updatedBy = currentUser.id;

		return UserEntityMapper.toDomainShallow(
			await UserDrizzleRepository.create(entity),
		) as User;
	}

	async update(dto: UpsertUserDTO): Promise<User> {
		logger.info(`Updating user: ${dto.email}`);

		const now = new Date();
		const currentUser = await UserDrizzleRepository.findUserInContext();
		if (!currentUser) {
			throw new Error("Current user not found in context");
		}

		const existingUser =
			await UserDrizzleRepository.findShallowByEmailAndState(
				dto.email,
				ActiveState.ACTIVE,
			);
		if (!existingUser) {
			throw new Error(`User with email ${dto.email} not found`);
		}

		existingUser.name = dto.name;
		existingUser.updatedAt = now;
		existingUser.updatedBy = currentUser.id;

		return UserEntityMapper.toDomainShallow(
			await UserDrizzleRepository.update(existingUser),
		) as User;
	}

	async replaceRoles(
		userUuid: UUID,
		roleUuids: UUID[],
	): Promise<UserWithRolesPermissionsAndTeams> {
		logger.info(`Replacing roles for user with UUID: ${userUuid}`);

		const now = new Date();
		const currentUser = await UserDrizzleRepository.findUserInContext();
		if (!currentUser) {
			throw new Error("Current user not found in context");
		}

		const userEntity =
			await UserDrizzleRepository.findByUuidAndStateWithAssignedRoles(
				userUuid,
				ActiveState.ACTIVE,
			);
		if (!userEntity) {
			throw new Error(`User with UUID ${userUuid} not found`);
		}

		const roles = await RoleDrizzleRepository.findByUuidIn(roleUuids);
		if (!roles || roles.length === 0) {
			throw new Error(
				`No roles found with the provided UUIDs: ${roleUuids.join(", ")}`,
			);
		} else if (roles.length !== roleUuids.length) {
			const foundRoleUuids = roles.map((role) => role.uuid);
			const missingRoleUuids = roleUuids.filter(
				(uuid) => !foundRoleUuids.includes(uuid),
			);
			throw new Error(
				`Some roles not found with the provided UUIDs: ${missingRoleUuids.join(", ")}`,
			);
		}

		const toDeleteIds = userEntity.roles
			.filter((role) => !roleUuids.includes(role.uuid))
			.map((role) => role.id);
		const toAddIds = roles
			.filter(
				(role) =>
					!userEntity.roles.some(
						(existingRole) => existingRole.uuid === role.uuid,
					),
			)
			.map((role) => role.id);

		await UserDrizzleRepository.replaceRolesInTransaction(
			userEntity.id,
			toDeleteIds,
			toAddIds,
			now,
			currentUser,
		);

		return UserEntityMapper.toDomainWithRolesPermissionsAndTeams(
			await UserDrizzleRepository.findByUuidAndStateWithRolesPermissionsAndTeams(
				userUuid,
				ActiveState.ACTIVE,
			),
		) as UserWithRolesPermissionsAndTeams;
	}
}
