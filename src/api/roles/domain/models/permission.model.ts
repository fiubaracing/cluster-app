export const PermissionEnum = {
	GLOBAL_READ: "GLOBAL_READ",
	GLOBAL_ADD: "GLOBAL_ADD",
	GLOBAL_EDIT: "GLOBAL_EDIT",
	GLOBAL_DELETE: "GLOBAL_DELETE",
	OWN_READ: "OWN_READ",
	OWN_ADD: "OWN_ADD",
	OWN_EDIT: "OWN_EDIT",
	OWN_DELETE: "OWN_DELETE",
	TEAM_READ: "TEAM_READ",
	TEAM_ADD: "TEAM_ADD",
	TEAM_EDIT: "TEAM_EDIT",
	TEAM_DELETE: "TEAM_DELETE",
} as const;

export type Permission = (typeof PermissionEnum)[keyof typeof PermissionEnum];

export const PermissionSuffixEnum = {
	READ: "READ",
	ADD: "ADD",
	EDIT: "EDIT",
	DELETE: "DELETE",
} as const;
export type PermissionSuffix =
	(typeof PermissionSuffixEnum)[keyof typeof PermissionSuffixEnum];
