import { UUID } from "crypto";

export class ReplaceUserRolesDTO {
    userUuid!: UUID;
    roleUuids!: UUID[];
}