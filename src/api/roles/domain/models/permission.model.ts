export type Permission =
	| "GLOBAL_READ"
	| "GLOBAL_ADD"
	| "GLOBAL_EDIT"
	| "GLOBAL_DELETE"
	| "OWN_READ"
	| "OWN_ADD"
	| "OWN_EDIT"
	| "OWN_DELETE"
	| "TEAM_READ"
	| "TEAM_ADD"
	| "TEAM_EDIT"
	| "TEAM_DELETE";

export type PermissionSuffix = "READ" | "ADD" | "EDIT" | "DELETE";