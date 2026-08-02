import { pgSchema, pgTable, serial, uuid, varchar, timestamp, integer, foreignKey, primaryKey, unique, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const core = pgSchema("core");


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
