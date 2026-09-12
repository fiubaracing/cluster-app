import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import { UserRepositoryImpl } from "@/api/users/infrastructure/adapters/user.repository-impl";
import { UserWithRolesPermissionsAndTeams } from "@/api/users/domain/models/user.model";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserNotFoundException } from "../../exceptions/user-not-found.exception";
import { ActiveState } from "@/api/shared/domain/enums/active-state";
import { UUID } from "crypto";

interface FindUserByUuidWithRolesPermissionsAndTeamsUseCaseDependencies {
	userRepository?: UserRepository;
}

export class FindUserByUuidWithRolesPermissionsAndTeamsUseCase {
	private readonly userRepository: UserRepository;

	constructor(
		deps?: FindUserByUuidWithRolesPermissionsAndTeamsUseCaseDependencies,
	) {
		this.userRepository = deps?.userRepository ?? new UserRepositoryImpl();
	}

	/**
	 * Executes the use case to find a user by UUID with roles and permissions.
	 * @param uuid - The UUID of the user to find.
	 * @returns A promise that resolves to a UserWithRolesAndPermissions object.
	 */
	public async execute(
		uuid: UUID,
	): Promise<UserWithRolesPermissionsAndTeams> {
		logger.info(
			`Use case FindUserByUuidWithRolesPermissionsAndTeamsUseCase started for uuid: ${uuid}`,
		);

		const user =
			await this.userRepository.findByUuidAndStateWithRolesPermissionsAndTeams(
				uuid,
				ActiveState.ACTIVE,
			);

		if (!user) {
			throw UserNotFoundException.fromUuid(uuid);
		}

		logger.info(
			"Use case FindUserByUuidWithRolesPermissionsAndTeamsUseCase completed successfully",
		);
		return user;
	}
}
