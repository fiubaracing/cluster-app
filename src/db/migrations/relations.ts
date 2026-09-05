import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	usersInCore: {
		usersInCoreCreatedBy: r.one.usersInCore({
			from: r.usersInCore.createdBy,
			to: r.usersInCore.id,
			alias: "usersInCore_createdBy_usersInCore_id"
		}),
		usersInCoresCreatedBy: r.many.usersInCore({
			alias: "usersInCore_createdBy_usersInCore_id"
		}),
		usersInCoreDeactivatedBy: r.one.usersInCore({
			from: r.usersInCore.deactivatedBy,
			to: r.usersInCore.id,
			alias: "usersInCore_deactivatedBy_usersInCore_id"
		}),
		usersInCoresDeactivatedBy: r.many.usersInCore({
			alias: "usersInCore_deactivatedBy_usersInCore_id"
		}),
		usersInCoreUpdatedBy: r.one.usersInCore({
			from: r.usersInCore.updatedBy,
			to: r.usersInCore.id,
			alias: "usersInCore_updatedBy_usersInCore_id"
		}),
		usersInCoresUpdatedBy: r.many.usersInCore({
			alias: "usersInCore_updatedBy_usersInCore_id"
		}),
	},
}))