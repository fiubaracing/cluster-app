import { UUID } from "crypto";

export class UpsertTeamDTO {
    uuid?: UUID;
    name!: string;
    description!: string | null;
}