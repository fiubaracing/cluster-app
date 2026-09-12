import { UUID } from "crypto";

export class ReplaceUserTeamsDTO {
    userUuid!: UUID;
    teamUuids!: UUID[];
}