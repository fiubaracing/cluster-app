import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import {
	User,
	UserWithCreator,
	UserWithRolesPermissionsAndTeams,
} from "@/api/users/domain/models/user.model";
import { UpsertUserDTO } from "../../application/dtos/upsert-user.dto";
import { UUID } from "crypto";

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
	 * Finds a shallow user by their email address and active state, including the creator information.
	 * @param email - The email address of the user to find.
	 * @param state - The active state of the user to filter by.
	 * @returns A promise that resolves to the User object if found, or null if not found.
	 */
	findShallowByEmailAndStateWithCreator(
		email: string,
		state: ActiveStateType,
	): Promise<UserWithCreator | null>;

	/**
	 * Finds a shallow user by their UUID and active state.
	 * @param uuid - The UUID of the user to find.
	 * @param state - The active state of the user to filter by.
	 * @returns A promise that resolves to the User object if found, or null if not found.
	 */
	findShallowByUuidAndState(
		uuid: UUID,
		state: ActiveStateType,
	): Promise<User | null>;

	/**
	 * Finds a shallow user by their UUID and active state, including the creator information.
	 * @param uuid - The UUID of the user to find.
	 * @param state - The active state of the user to filter by.
	 * @returns A promise that resolves to the User object if found, or null if not found.
	 */
	findShallowByUuidAndStateWithCreator(
		uuid: UUID,
		state: ActiveStateType,
	): Promise<UserWithCreator | null>;

	/**
	 * Finds a user by their UUID and active state, including their roles and permissions.
	 * @param uuid - The UUID of the user to find.
	 * @param state - The active state of the user to filter by.
	 * @returns A promise that resolves to the User object if found, or null if not found.
	 */
	findByUuidAndStateWithRolesPermissionsAndTeams(
		uuid: UUID,
		state: ActiveStateType,
	): Promise<UserWithRolesPermissionsAndTeams | null>;

	/**
	 * Creates a new user in the repository.
	 * @param dto - The data transfer object containing the user information to create.
	 * @returns A promise that resolves to the created User object.
	 */
	create(dto: UpsertUserDTO): Promise<User>;

	/**
	 * Updates an existing user in the repository.
	 * @param dto - The data transfer object containing the user information to update.
	 * @returns A promise that resolves to the updated User object.
	 */
	update(dto: UpsertUserDTO): Promise<User>;

	/**
	 * Replaces the roles of a user with the specified roles.
	 * @param userUuid - The UUID of the user whose roles are to be replaced.
	 * @param roleUuids - An array of UUIDs representing the new roles to assign to the user.
	 * @returns A promise that resolves to the updated User object with roles, permissions, and teams if successful, or null if the user was not found.
	 */
	replaceRoles(userUuid: UUID, roleUuids: UUID[]): Promise<UserWithRolesPermissionsAndTeams>;
}
