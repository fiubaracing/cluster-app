import { UUID } from "@/api/shared/domain/models/uuid";

export class UserResponse {
	uuid!: UUID;
	email!: string;
	name!: string;
}
