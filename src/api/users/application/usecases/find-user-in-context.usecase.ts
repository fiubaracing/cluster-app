import { UserWithRolesPermissionsAndTeams } from "@/api/users/domain/models/user.model";
import { logger } from "@/api/shared/infrastructure/config/logger";
import context from "@/api/shared/infrastructure/config/store";

export class FindUserInContextUseCase {
	/**
	 * Finds the user in the current context.
	 * @returns A promise that resolves to the UserWithRolesPermissionsAndTeams object if found, or null if no context is available.
	 */
	async execute(): Promise<UserWithRolesPermissionsAndTeams | null> {
		logger.info(`Use case FindUserInContextUseCase started`);

		const user = context.store.user ?? null;

		logger.info("Use case FindUserInContextUseCase completed successfully");
		return user;
	}
}
