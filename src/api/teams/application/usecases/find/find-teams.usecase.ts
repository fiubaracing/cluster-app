import { logger } from "@/api/shared/infrastructure/config/logger";
import { UUID } from "crypto";
import { Team } from "@/api/teams/domain/models/team.model";
import { TeamRepository } from "@/api/teams/domain/repositories/team.repository";
import { TeamRepositoryImpl } from "@/api/teams/infrastructure/adapters/team.repository-impl";
import { TeamNotFoundException } from "@/api/teams/application/exceptions/team-not-found.exception";

interface FindTeamsUseCaseDependencies {
	teamRepository?: TeamRepository;
}

export class FindTeamsUseCase {
	private readonly teamRepository: TeamRepository;

	constructor(deps?: FindTeamsUseCaseDependencies) {
		this.teamRepository = deps?.teamRepository ?? new TeamRepositoryImpl();
	}

	/**
	 * Executes the use case to find Teams by their UUIDs.
	 * @param uuids - An array of UUIDs representing the Teams to find.
	 * @returns A promise that resolves to an array of Team objects if found, or an empty array if not found.
	 * @throws {TeamNotFoundException} if any of the provided team UUIDs do not exist.
	 */
	async execute(uuids: UUID[]): Promise<Team[]> {
		logger.info(
			`Use case FindTeamsUseCase started for uuids: ${uuids.join(", ")}`,
		);

		const teams = await this.teamRepository.findByUuidIn(uuids);

		if (teams.length !== uuids.length) {
			const foundUuids = teams.map((team) => team.uuid);
			const notFoundUuids = uuids.filter(
				(uuid) => !foundUuids.includes(uuid),
			);
			throw TeamNotFoundException.fromUuids(notFoundUuids);
		}

		logger.info("Use case FindTeamsUseCase completed successfully");

		return teams;
	}
}
