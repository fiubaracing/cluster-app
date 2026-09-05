import { pgSchema, pgTable, integer, serial, uuid, varchar, interval, text, timestamp, foreignKey, primaryKey, unique, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const core = pgSchema("core");


export const modulesInCore = core.table("modules", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
}, (table) => [
	unique("modules_name_key").on(table.name),]);

export const permissionsInCore = core.table("permissions", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
}, (table) => [
	unique("permissions_name_key").on(table.name),]);

export const rolePermissionsInCore = core.table("role_permissions", {
	roleId: integer("role_id").notNull().references(() => rolesInCore.id, { onDelete: "cascade" } ),
	permissionId: integer("permission_id").notNull().references(() => permissionsInCore.id, { onDelete: "cascade" } ),
	moduleId: integer("module_id").notNull().references(() => modulesInCore.id, { onDelete: "cascade" } ),
}, (table) => [
	primaryKey({ columns: [table.roleId, table.permissionId, table.moduleId], name: "role_permissions_pkey"}),
]);

export const rolesInCore = core.table("roles", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	uuid: uuid().defaultRandom().notNull(),
}, (table) => [
	unique("roles_name_key").on(table.name),	unique("roles_uuid_key").on(table.uuid),]);

export const teamsInCore = core.table("teams", {
	id: serial().primaryKey(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
	createdBy: integer("created_by").references(() => usersInCore.id, { onDelete: "set null" } ),
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	updatedBy: integer("updated_by").references(() => usersInCore.id, { onDelete: "set null" } ),
	deactivatedAt: timestamp("deactivated_at"),
	deactivatedBy: integer("deactivated_by").references(() => usersInCore.id, { onDelete: "set null" } ),
	state: varchar({ length: 10 }).notNull(),
}, (table) => [
	unique("teams_name_key").on(table.name),	unique("teams_uuid_key").on(table.uuid),check("teams_state_check", sql`((state)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[]))`),]);

export const userResourceLimitsInCore = core.table("user_resource_limits", {
	id: serial().primaryKey(),
	userId: integer("user_id").notNull().references(() => usersInCore.id, { onDelete: "cascade" } ),
	runtimeHours: interval("runtime_hours"),
	maxMemory: integer("max_memory"),
	maxTasks: integer("max_tasks").notNull(),
	maxProjects: integer("max_projects"),
});

export const userRolesInCore = core.table("user_roles", {
	userId: integer("user_id").notNull().references(() => usersInCore.id, { onDelete: "cascade" } ),
	roleId: integer("role_id").notNull().references(() => rolesInCore.id, { onDelete: "cascade" } ),
	state: varchar({ length: 10 }).notNull(),
	createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
	createdBy: integer("created_by").references(() => usersInCore.id, { onDelete: "set null" } ),
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	updatedBy: integer("updated_by").references(() => usersInCore.id, { onDelete: "set null" } ),
	deactivatedAt: timestamp("deactivated_at"),
	deactivatedBy: integer("deactivated_by").references(() => usersInCore.id, { onDelete: "set null" } ),
}, (table) => [
	primaryKey({ columns: [table.userId, table.roleId], name: "user_roles_pkey"}),
check("user_roles_state_check", sql`((state)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[]))`),]);

export const userTeamsInCore = core.table("user_teams", {
	userId: integer("user_id").notNull().references(() => usersInCore.id, { onDelete: "cascade" } ),
	teamId: integer("team_id").notNull().references(() => teamsInCore.id, { onDelete: "cascade" } ),
	state: varchar({ length: 10 }).notNull(),
	createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
	createdBy: integer("created_by").references(() => usersInCore.id, { onDelete: "set null" } ),
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	updatedBy: integer("updated_by").references(() => usersInCore.id, { onDelete: "set null" } ),
	deactivatedAt: timestamp("deactivated_at"),
	deactivatedBy: integer("deactivated_by").references(() => usersInCore.id, { onDelete: "set null" } ),
}, (table) => [
	primaryKey({ columns: [table.userId, table.teamId], name: "user_teams_pkey"}),
check("user_teams_state_check", sql`((state)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[]))`),]);

export const usersInCore = core.table("users", {
	id: serial().primaryKey(),
	uuid: uuid().defaultRandom(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	state: varchar({ length: 10 }).notNull(),
	createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
	createdBy: integer("created_by"),
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	updatedBy: integer("updated_by"),
	deactivatedAt: timestamp("deactivated_at"),
	deactivatedBy: integer("deactivated_by"),
}, (table) => [
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [table.id],
		name: "users_created_by_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.deactivatedBy],
		foreignColumns: [table.id],
		name: "users_deactivated_by_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.updatedBy],
		foreignColumns: [table.id],
		name: "users_updated_by_fkey"
	}).onDelete("set null"),
	unique("users_email_key").on(table.email),	unique("users_uuid_key").on(table.uuid),check("users_state_check", sql`((state)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[]))`),]);
