import { UpserUserRequestBody } from "@/api/users/presentation/dtos/requests/upsert-user.request";
import { UpsertUserDTO } from "@/api/users/application/dtos/upsert-user.dto";
import { ReplaceUserRolesDTO } from "../dtos/replace-user-roles.dto";
import { ReplaceUserRolesRequestBody } from "../../presentation/dtos/requests/replace-user-roles.request";
import { ReplaceUserTeamsDTO } from "../dtos/replace-user-teams.dto";
import { ReplaceUserTeamsRequestBody } from "../../presentation/dtos/requests/replace-user-teams.request";

export class UserMapper {
    static toUpsertUserDTO(body: UpserUserRequestBody): UpsertUserDTO {
        const dto = new UpsertUserDTO();
        dto.email = body.email;
        dto.name = body.name ?? '';
        return dto;
    }

    static toReplaceUserRolesDTO(body: ReplaceUserRolesRequestBody): ReplaceUserRolesDTO {
        const dto = new ReplaceUserRolesDTO();
        dto.roleUuids = body.roleUuids;
        return dto;
    }

    static toReplaceUserTeamsDTO(body: ReplaceUserTeamsRequestBody): ReplaceUserTeamsDTO {
        const dto = new ReplaceUserTeamsDTO();
        dto.teamUuids = body.teamUuids;
        return dto;
    }
}