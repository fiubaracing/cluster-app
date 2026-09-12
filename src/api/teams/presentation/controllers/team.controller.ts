import {
    Endpoint,
    parseJSON,
    validator,
} from "@/api/shared/infrastructure/handlers";
import { ApiRequest, ApiResponse } from "@/api/shared/types/api";
import { constants } from "http2";
import { PermissionSuffixEnum } from "@/api/roles/domain/models/permission.model";
import { ModuleEnum } from "@/api/roles/domain/models/module.model";
import { UpsertTeamUseCase } from "@/api/teams/application/usecases/upsert/upsert-team.usecase";
import { UpsertTeamDTO } from "@/api/teams/application/dtos/upsert-team.dto";
import { UpsertTeamRequestBody, upsertTeamRequestBodySchema } from "../dtos/requests/upsert-team.request";
import { TeamMapper } from "@/api/teams/application/mappers/team.mapper";
import { TeamResponseMapper } from "@/api/teams/presentation/mappers/team-response.mapper";

interface TeamControllerDependencies {
    upsertTeamUseCase: UpsertTeamUseCase;
}

export default class TeamController {
    private readonly upsertTeamUseCase: UpsertTeamUseCase;

    constructor(deps?: TeamControllerDependencies) {
        this.upsertTeamUseCase =
            deps?.upsertTeamUseCase ?? new UpsertTeamUseCase();
    }

    @Endpoint({
        module: ModuleEnum.TEAMS,
        permission: [PermissionSuffixEnum.ADD, PermissionSuffixEnum.EDIT],
    })
    async upsertTeam(req: ApiRequest): Promise<ApiResponse> {
        const rawBody = await parseJSON(req);
        const body: UpsertTeamRequestBody = await validator(
            upsertTeamRequestBodySchema,
            rawBody,
        );

        const dto: UpsertTeamDTO = TeamMapper.toUpsertDTO(body);
        const team = await this.upsertTeamUseCase.execute(dto);

        const response = ApiResponse.json(
            TeamResponseMapper.toResponse(team),
            {
                status: constants.HTTP_STATUS_OK,
            },
        );

        return response;
    }
}
