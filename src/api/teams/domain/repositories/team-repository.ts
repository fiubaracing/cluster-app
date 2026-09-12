import { UpsertTeamDTO } from "@/api/teams/application/dtos/upsert-team.dto";
import { Team, TeamWithCreator } from "@/api/teams/domain/models/team";

export interface TeamRepository {
    /**
     * Creates a team in the database.
     * @param dto The data transfer object containing the team information.
     * @returns A promise that resolves to the created Team object.
     */
    create(dto: UpsertTeamDTO): Promise<Team>;

    /**
     * Updates a team in the database.
     * @param dto The data transfer object containing the updated team information.
     * @returns A promise that resolves to the updated Team object.
     */
    update(dto: UpsertTeamDTO): Promise<Team>;

    /**
     * Finds a shallow team by their name.
     * @param name The name of the team to find.
     * @returns A promise that resolves to the Team object if found, or null if not found.
     */
    findByNameWithCreator(name: string): Promise<TeamWithCreator | null>
}