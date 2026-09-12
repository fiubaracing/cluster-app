import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import {
	ActiveState,
	ActiveStateType,
} from "@/api/shared/domain/enums/active-state";
import { UserDrizzleRepository } from "@/api/users/infrastructure/repositories/user.drizzle.repository";
import { UserEntityMapper } from "./mappers/user-entity.mapper";
import {
	User,
	UserWithCreator,
	UserWithRolesPermissionsAndTeams,
} from "../../domain/models/user.model";
import { UpsertUserDTO } from "../../application/dtos/upsert-user.dto";
import { UserEntity } from "../entities/user.entity";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UUID } from "crypto";

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
}
