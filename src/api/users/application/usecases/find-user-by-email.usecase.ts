import { User } from "@/api/users/domain/models/user.model";
import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import { ActiveState } from "@/api/shared/domain/enums/active-state";
import { UserNotFoundException } from "@/api/users/application/exceptions/user-not-found.exception";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserRepositoryImpl } from "../../infrastructure/adapters/user.repository-impl";

interface FindShallowUserByEmailUseCaseDependencies {
	userRepository?: UserRepository;
}

export class FindShallowUserByEmailUseCase {
	private readonly userRepository: UserRepository;

	constructor(deps?: FindShallowUserByEmailUseCaseDependencies) {
		this.userRepository = deps?.userRepository ?? new UserRepositoryImpl();
	}

	async execute(email: string): Promise<User> {
		logger.info(
			`Use case FindShallowUserByEmailUseCase started for email: ${email}`,
		);

		const user = await this.userRepository.findShallowByEmailAndState(
			email,
			ActiveState.ACTIVE,
		);

		if (!user) {
			throw new UserNotFoundException(email);
		}

		logger.info(
			"Use case FindShallowUserByEmailUseCase completed successfully",
		);
		return user;
	}
}
