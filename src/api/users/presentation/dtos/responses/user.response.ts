import { UUID } from "crypto";

export class UserResponse {
	uuid!: UUID;
	email!: string;
	name!: string;
}
