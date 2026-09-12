import { db } from "@/api/shared/infrastructure/config/db";
import { teamsInCore, usersInCore } from "@/db/migrations/schema";
import { eq } from "drizzle-orm";
import { TeamEntity, TeamEntityWithCreator } from "@/api/teams/infrastructure/entities/team.entity";
import { UUID } from "crypto";

export class TeamDrizzleRepository {
	static async create(user: TeamEntity): Promise<TeamEntity> {
		const [createdTeam] = await db
			.insert(teamsInCore)
			.values(user)
			.returning();
		return createdTeam as TeamEntity;
	}

	static async update(team: TeamEntity): Promise<TeamEntity> {
		const [updatedTeam] = await db
			.update(teamsInCore)
			.set(team)
			.where(eq(teamsInCore.uuid, team.uuid))
			.returning();
		return updatedTeam as TeamEntity;
	}

	static async findByUuid(uuid: UUID): Promise<TeamEntity | null> {
		return await db
			.select()
			.from(teamsInCore)
			.where(eq(teamsInCore.uuid, uuid))
			.limit(1)
			.then((result) => {
				return result.length === 0 ? null : (result[0] as TeamEntity);
			});
	}

	static async findByNameWithCreator(name: string): Promise<TeamEntityWithCreator | null> {
		return await db
			.select({
                ...teamsInCore._.columns,
                createdBy: usersInCore._.columns,
            })
			.from(teamsInCore)
			.where(eq(teamsInCore.name, name))
            .leftJoin(usersInCore, eq(teamsInCore.createdBy, usersInCore.id))
			.limit(1)
			.then((result) => {
				return result.length === 0 ? null : (result[0] as TeamEntityWithCreator);
			});
	}
}
