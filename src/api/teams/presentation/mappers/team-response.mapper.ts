import { Team } from "@/api/teams/domain/models/team.model";
import { TeamResponse } from "@/api/teams/presentation/dtos/responses/team.response";

export class TeamResponseMapper {
	static toResponse(team: Team): TeamResponse {
		const response = new TeamResponse();
		response.uuid = team.uuid;
		response.name = team.name;
		response.description = team.description;
		return response;
	}
}
