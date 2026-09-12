import { UUID } from "crypto";

export class TeamResponse {
    uuid!: UUID;
    name!: string;
    description!: string | null;
};