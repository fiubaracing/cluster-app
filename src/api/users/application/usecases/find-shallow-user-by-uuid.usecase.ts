import { User } from "@/api/users/domain/models/user.model";
import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import { ActiveState } from "@/api/shared/domain/enums/active-state";
import { UserNotFoundException } from "@/api/users/application/exceptions/user-not-found.exception";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserRepositoryImpl } from "../../infrastructure/adapters/user.repository-impl";

interface FindShallowUserByUuidUseCaseDependencies {
    userRepository?: UserRepository;
}

export class FindShallowUserByUuidUseCase {
    private readonly userRepository: UserRepository;

    constructor(deps?: FindShallowUserByUuidUseCaseDependencies) {
        this.userRepository = deps?.userRepository ?? new UserRepositoryImpl();
    }

    /**
     * Executes the use case to find a shallow user by their email address.
     * @param email - The email address of the user to find.
     * @returns A promise that resolves to the User object if found, or throws a UserNotFoundException if not found.
     * @throws UserNotFoundException if no user is found with the provided email address.
     */
    async execute(uuid: string): Promise<User> {
        logger.info(
            `Use case FindShallowUserByUuidUseCase started for uuid: ${uuid}`,
        );

        const user = await this.userRepository.findShallowByUuidAndState(
            uuid,
            ActiveState.ACTIVE,
        );

        if (!user) {
            throw UserNotFoundException.fromUuid(uuid);
        }

        logger.info(
            "Use case FindShallowUserByUuidUseCase completed successfully",
        );
        return user;
    }
}
