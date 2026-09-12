import { Team, TeamWithCreator } from "@/api/teams/domain/models/team";
import { TeamRepository } from "@/api/teams/domain/repositories/team-repository";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { ValidateAccessUseCase } from "@/api/auth/application/usecases/validate/validate-access.usecase";
import { ValidateItemAccessDTO } from "@/api/auth/application/dtos/validate-access.dto";
import { ModuleEnum } from "@/api/roles/domain/models/module.model";
import { PermissionSuffixEnum } from "@/api/roles/domain/models/permission.model";
import { TeamRepositoryImpl } from "@/api/teams/infrastructure/adapters/team.repository-impl";
import { UpsertTeamDTO } from "@/api/teams/application/dtos/upsert-team.dto";

interface UpsertTeamUseCaseDependencies {
	teamRepository?: TeamRepository;
	validateAccessUseCase?: ValidateAccessUseCase;
}

export class UpsertTeamUseCase {
	private readonly teamRepository: TeamRepository;
	private readonly validateAccessUseCase: ValidateAccessUseCase;

	constructor(deps?: UpsertTeamUseCaseDependencies) {
		this.teamRepository = deps?.teamRepository ?? new TeamRepositoryImpl();
		this.validateAccessUseCase =
			deps?.validateAccessUseCase ?? new ValidateAccessUseCase();
	}

	/**
	 * Executes the use case to find a shallow Team by their email address.
	 * @param email - The email address of the Team to find.
	 * @returns A promise that resolves to the Team object if found, or throws a TeamNotFoundException if not found.
	 * @throws {TeamNotFoundException} if no Team is found with the provided email address.
	 * @throws {ForbiddenException} if the user does not have the required access to create or update a Team.
	 * @returns A promise that resolves to the upserted Team object.
	 */
	async execute(dto: UpsertTeamDTO): Promise<Team> {
		logger.info(`Use case UpsertTeamUseCase started for name: ${dto.name}`);

		const team = await this.teamRepository.findByNameWithCreator(dto.name);

		const upsertedTeam =
			!team ?
				await this.createTeam(dto)
			:	await this.updateTeam(team, dto);

		logger.info("Use case UpsertTeamUseCase completed successfully");

		return upsertedTeam;
	}

	private async createTeam(dto: UpsertTeamDTO): Promise<Team> {
		const validateDto = new ValidateItemAccessDTO();
		validateDto.module = ModuleEnum.TEAMS;
		validateDto.permission = PermissionSuffixEnum.ADD;

		this.validateAccessUseCase.execute(validateDto);

		return await this.teamRepository.create(dto);
	}

	private async updateTeam(
		team: TeamWithCreator,
		dto: UpsertTeamDTO,
	): Promise<Team> {
		const validateDto = new ValidateItemAccessDTO();
		validateDto.module = ModuleEnum.TEAMS;
		validateDto.permission = PermissionSuffixEnum.EDIT;
		validateDto.ownerUuid =
			team.createdBy ? team.createdBy.uuid : undefined;

		this.validateAccessUseCase.execute(validateDto);

		return await this.teamRepository.update(dto);
	}
}
