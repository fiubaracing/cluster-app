import { UUID } from "crypto";

export const RoleEnum = {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    GUEST: "GUEST",
    FRT: "FRT",
} as const;

export type RoleType = keyof typeof RoleEnum;

export class Role {
    uuid!: UUID;
    name!: RoleType;
    description!: string | null;
}