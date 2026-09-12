import { UUID } from "crypto";

export class RoleEntity {
    id!: number;
    uuid!: UUID;
    name!: string;
    description!: string | null;
}