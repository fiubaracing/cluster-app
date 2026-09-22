import type { UUID } from "crypto";
import type { User } from "@/api/users/domain/models/user.model";

export class Team {
  uuid!: UUID;
  name!: string;
  description!: string | null;
}

export type TeamWithCreator = Team & {
  createdBy: User | null;
};
