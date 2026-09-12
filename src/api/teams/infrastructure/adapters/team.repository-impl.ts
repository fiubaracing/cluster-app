import { TeamRepository } from "@/api/teams/domain/repositories/team-repository";
import { Team, TeamWithCreator } from "@/api/teams/domain/models/team";
import { UpsertTeamDTO } from "@/api/teams/application/dtos/upsert-team.dto";
import { TeamDrizzleRepository } from "@/api/teams/infrastructure/repositories/team.drizzle.repository";
import { UserDrizzleRepository } from "@/api/users/infrastructure/repositories/user.drizzle.repository";
import { TeamEntity } from "@/api/teams/infrastructure/entities/team.entity";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UUID } from "crypto";
import { ActiveState } from "@/api/shared/domain/enums/active-state";
import { TeamEntityMapper } from "@/api/teams/infrastructure/adapters/mappers/team-entity.mapper";

export class TeamRepositoryImpl implements TeamRepository {
	async create(dto: UpsertTeamDTO): Promise<Team> {
		logger.info(`Creating team with name: ${dto.name}`);

		const now = new Date();
		const currentUser = await UserDrizzleRepository.findUserInContext();
		if (!currentUser) {
			throw new Error("Current user not found in context");
		}

		const entity = new TeamEntity();
		entity.uuid = crypto.randomUUID() as UUID;
		entity.name = dto.name;
		entity.description = dto.description ?? null;
		entity.state = ActiveState.ACTIVE;
		entity.createdAt = now;
		entity.createdBy = currentUser.id;
		entity.updatedAt = now;
		entity.updatedBy = currentUser.id;

		return TeamEntityMapper.toDomain(
			await TeamDrizzleRepository.create(entity),
		) as Team;
	}

	async update(dto: UpsertTeamDTO): Promise<Team> {
		logger.info(`Updating team with name: ${dto.name}`);

		const now = new Date();
		const currentUser = await UserDrizzleRepository.findUserInContext();
		if (!currentUser) {
			throw new Error("Current user not found in context");
		}

		const entity = await TeamDrizzleRepository.findByUuid(dto.uuid!);
		if (!entity) {
			throw new Error(`Team with UUID ${dto.uuid} not found`);
		}

		entity.name = dto.name;
		entity.description = dto.description ?? null;
		entity.updatedAt = now;
		entity.updatedBy = currentUser.id;

		return TeamEntityMapper.toDomain(
			await TeamDrizzleRepository.update(entity),
		) as Team;
	}

	async findByNameWithCreator(name: string): Promise<TeamWithCreator | null> {
		logger.info(`Finding team by name: ${name}`);

		return TeamEntityMapper.toDomainWithCreator(
			await TeamDrizzleRepository.findByNameWithCreator(name),
		);
	}
}
