import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { User } from "@/api/users/domain/models/user.model";

export interface UserRepository {
	/**
	 * Finds a shallow user by their email address and active state.
	 * @param email - The email address of the user to find.
	 * @param state - The active state of the user to filter by.
	 * @returns A promise that resolves to the User object if found, or null if not found.
	 */
	findShallowByEmailAndState(
		email: string,
		state: ActiveStateType,
	): Promise<User | null>;

	/**
	 * Finds a shallow user by their UUID and active state.
	 * @param uuid - The UUID of the user to find.
	 * @param state - The active state of the user to filter by.
	 * @returns A promise that resolves to the User object if found, or null if not found.
	 */
	findShallowByUuidAndState(
		uuid: string,
		state: ActiveStateType,
	): Promise<User | null>;
}
