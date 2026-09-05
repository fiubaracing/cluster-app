import { db } from "@/api/shared/infrastructure/config/db";
import { usersInCore } from "@/db/migrations/schema";
import { UserEntity } from "@/api/users/infrastructure/entities/user.entity";
import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { and, eq } from "drizzle-orm";

export class UserDrizzleRepository {
	static async findShallowByEmailAndState(
		email: string,
		state: ActiveStateType,
	): Promise<UserEntity | null> {
		return await db
			.select()
			.from(usersInCore)
			.where(
				and(eq(usersInCore.email, email), eq(usersInCore.state, state)),
			)
			.limit(1)
			.then((result) => {
				return result.length === 0 ? null : result[0] as UserEntity;
			});
	}

	static async findByUuidAndState(
		uuid: string,
		state: ActiveStateType,
	): Promise<UserEntity | null> {
		return await db
			.select()
			.from(usersInCore)
			.where(
				and(eq(usersInCore.uuid, uuid), eq(usersInCore.state, state)),
			)
			.limit(1)
			.then((result) => {
				return result.length === 0 ? null : result[0] as UserEntity;
			});
	}
}
