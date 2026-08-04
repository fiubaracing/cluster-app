import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { UserDrizzleRepository } from "@/api/users/infrastructure/repositories/user.drizzle.repository";
import { UserEntityMapper } from "./mappers/user-entity.mapper";
import { User } from "../../domain/models/user.model";

export class UserRepositoryImpl implements UserRepository {
	async findShallowByEmailAndState(
		email: string,
		state: ActiveStateType,
	): Promise<User | null> {
		return UserEntityMapper.toDomainShallow(
			await UserDrizzleRepository.findShallowByEmailAndState(
				email,
				state,
			),
		);
	}

	async findShallowByUuidAndState(
		uuid: string,
		state: ActiveStateType,
	): Promise<User | null> {
		return UserEntityMapper.toDomainShallow(
			await UserDrizzleRepository.findByUuidAndState(uuid, state),
		);
	}
}
