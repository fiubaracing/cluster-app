export const ModuleEnum = {
	USERS: "USERS",
	TEAMS: "TEAMS",
	HELYX: "HELYX",
} as const;

export type Module = (typeof ModuleEnum)[keyof typeof ModuleEnum];
