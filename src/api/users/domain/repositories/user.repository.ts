import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { User } from "@/api/users/domain/models/user.model";

export interface UserRepository {
	findShallowByEmailAndState(
		email: string,
		state: ActiveStateType,
	): Promise<User | null>;
}
