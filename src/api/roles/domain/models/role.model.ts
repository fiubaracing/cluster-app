export const RoleEnum = {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    GUEST: "GUEST",
    FRT: "FRT",
} as const;

export type RoleType = keyof typeof RoleEnum;