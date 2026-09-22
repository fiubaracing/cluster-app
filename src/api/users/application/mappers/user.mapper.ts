import {
  type SortDirection,
  SortDirectionEnum,
} from "@/api/shared/domain/models/sort-direction.model";
import { UpsertUserDTO } from "@/api/users/application/dtos/upsert-user.dto";
import type { UpserUserRequestBody } from "@/api/users/presentation/dtos/requests/upsert-user.request";
import {
  type UserSortFields,
  UserSortFieldsEnum,
} from "../../domain/models/user-sort-fields.model";
import type { ReplaceUserRolesRequestBody } from "../../presentation/dtos/requests/replace-user-roles.request";
import type { ReplaceUserTeamsRequestBody } from "../../presentation/dtos/requests/replace-user-teams.request";
import { FindAllUsersDTO } from "../dtos/find-all-users.dto";
import { ReplaceUserRolesDTO } from "../dtos/replace-user-roles.dto";
import { ReplaceUserTeamsDTO } from "../dtos/replace-user-teams.dto";

export class UserMapper {
  static toUpsertUserDTO(body: UpserUserRequestBody): UpsertUserDTO {
    const dto = new UpsertUserDTO();
    dto.email = body.email;
    dto.name = body.name ?? "";
    return dto;
  }

  static toReplaceUserRolesDTO(
    body: ReplaceUserRolesRequestBody,
  ): ReplaceUserRolesDTO {
    const dto = new ReplaceUserRolesDTO();
    dto.roleUuids = body.roleUuids;
    return dto;
  }

  static toReplaceUserTeamsDTO(
    body: ReplaceUserTeamsRequestBody,
  ): ReplaceUserTeamsDTO {
    const dto = new ReplaceUserTeamsDTO();
    dto.teamUuids = body.teamUuids;
    return dto;
  }

  static toFindAllUsersDTO(queryParams: URLSearchParams): FindAllUsersDTO {
    const dto = new FindAllUsersDTO();
    dto.search = queryParams.get("search") || undefined;

    const page = queryParams.get("page")
      ? parseInt(queryParams.get("page")!)
      : 0;
    const safePage = isNaN(page) || page < 0 ? 0 : page;
    dto.page = safePage;

    const limit = queryParams.get("limit")
      ? parseInt(queryParams.get("limit")!)
      : 10;
    const safeLimit = isNaN(limit) || limit <= 0 ? 10 : limit;
    dto.limit = safeLimit;

    const direction =
      (queryParams.get("direction") as SortDirection) || SortDirectionEnum.ASC;
    dto.direction = direction;

    const sortFields = queryParams.getAll("sort") as UserSortFields[];
    const safeSortFields = sortFields.filter((field) =>
      Object.values(UserSortFieldsEnum).includes(field),
    );
    dto.sort = new Set(safeSortFields);

    return dto;
  }
}
