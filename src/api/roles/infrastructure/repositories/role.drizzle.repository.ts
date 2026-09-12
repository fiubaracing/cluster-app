import { db } from "@/api/shared/infrastructure/config/db";
import { rolesInCore } from "@/db/migrations/schema";
import { UUID } from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import { RoleEntity } from "../entities/role.entity";

export class RoleDrizzleRepository {
	static async findByUuidIn(uuids: UUID[]): Promise<RoleEntity[]> {
		return await db
			.select()
			.from(rolesInCore)
			.where(and(inArray(rolesInCore.uuid, uuids)))
			.then((result) => result as RoleEntity[]);
	}
}
