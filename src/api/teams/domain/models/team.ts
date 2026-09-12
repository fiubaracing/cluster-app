import { User } from "@/api/users/domain/models/user.model";
import { UUID } from "crypto";

export class Team {
	uuid!: UUID;
    name!: string;
    description!: string | null;
}

export type TeamWithCreator = Team & {
    createdBy: User | null;
}