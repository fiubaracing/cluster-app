import { UpsertTeamRequestBody } from "@/api/teams/presentation/dtos/requests/upsert-team.request";
import { UpsertTeamDTO } from "@/api/teams/application/dtos/upsert-team.dto";

export class TeamMapper {
    static toUpsertDTO(body: UpsertTeamRequestBody): UpsertTeamDTO {
        const dto = new UpsertTeamDTO();
        dto.name = body.name;
        dto.description = body.description ?? null;
        return dto;
    }
}