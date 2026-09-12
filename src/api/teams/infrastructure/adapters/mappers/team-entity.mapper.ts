import { Team, TeamWithCreator } from "@/api/teams/domain/models/team.model";
import {
	TeamEntity,
	TeamEntityWithCreator,
} from "@/api/teams/infrastructure/entities/team.entity";
import { UserEntityMapper } from "@/api/users/infrastructure/adapters/mappers/user-entity.mapper";

export class TeamEntityMapper {
	static toDomain(entity: TeamEntity | null): Team | null {
		if (!entity) {
			return null;
		}

		const team = new Team();
		team.uuid = entity.uuid;
		team.name = entity.name;
		team.description = entity.description;
		return team;
	}

	static toDomainArray(entities: TeamEntity[]): Team[] {
		return entities.map((entity) => this.toDomain(entity) as Team);
	}

	static toDomainWithCreator(
		entity: TeamEntityWithCreator | null,
	): TeamWithCreator | null {
		if (!entity) {
			return null;
		}

		const team = this.toDomain(entity as TeamEntity) as TeamWithCreator;
		const createdBy = UserEntityMapper.toDomainShallow(entity.createdBy);
		return { ...team, createdBy };
	}
}
