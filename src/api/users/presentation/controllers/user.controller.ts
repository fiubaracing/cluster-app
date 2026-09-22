import { constants } from "http2";
import { ModuleEnum } from "@/api/roles/domain/models/module.model";
import { PermissionSuffixEnum } from "@/api/roles/domain/models/permission.model";
import {
  Endpoint,
  parseJSON,
  validator,
} from "@/api/shared/infrastructure/handlers";
import { type ApiRequest, ApiResponse } from "@/api/shared/types/api";
import { FindUserInContextUseCase } from "@/api/users/application/usecases/find/find-user-in-context.usecase";
import { UpsertUserUseCase } from "@/api/users/application/usecases/upsert/upsert-user.usecase";
import type { UserWithRolesPermissionsAndTeams } from "@/api/users/domain/models/user.model";
import { UserResponseMapper } from "@/api/users/presentation/mappers/user-response.mapper";
import type { ReplaceUserRolesDTO } from "../../application/dtos/replace-user-roles.dto";
import type { ReplaceUserTeamsDTO } from "../../application/dtos/replace-user-teams.dto";
import type { UpsertUserDTO } from "../../application/dtos/upsert-user.dto";
import { UserMapper } from "../../application/mappers/user.mapper";
import { FindAllUsersUseCase } from "../../application/usecases/find/find-all-users.usecase";
import { ReplaceUserRolesUseCase } from "../../application/usecases/replace/replace-user-roles.usecase";
import { ReplaceUserTeamsUseCase } from "../../application/usecases/replace/replace-user-teams.usecase";
import {
  type ReplaceUserRolesParams,
  type ReplaceUserRolesRequestBody,
  replaceUserRolesRequestBodySchema,
} from "../dtos/requests/replace-user-roles.request";
import {
  type ReplaceUserTeamsParams,
  type ReplaceUserTeamsRequestBody,
  replaceUserTeamsRequestBodySchema,
} from "../dtos/requests/replace-user-teams.request";
import {
  type UpserUserRequestBody,
  upserUserRequestBodySchema,
} from "../dtos/requests/upsert-user.request";

interface UserControllerDependencies {
  findUserInContextUseCase?: FindUserInContextUseCase;
  upsertUserUseCase: UpsertUserUseCase;
  replaceUserRolesUseCase: ReplaceUserRolesUseCase;
  replaceUserTeamsUseCase: ReplaceUserTeamsUseCase;
  findAllUsersUseCase?: FindAllUsersUseCase;
}

export default class UserController {
  private readonly findUserInContextUseCase: FindUserInContextUseCase;
  private readonly upsertUserUseCase: UpsertUserUseCase;
  private readonly replaceUserRolesUseCase: ReplaceUserRolesUseCase;
  private readonly replaceUserTeamsUseCase: ReplaceUserTeamsUseCase;
  private readonly findAllUsersUseCase: FindAllUsersUseCase;

  constructor(deps?: UserControllerDependencies) {
    this.findUserInContextUseCase =
      deps?.findUserInContextUseCase ?? new FindUserInContextUseCase();
    this.upsertUserUseCase = deps?.upsertUserUseCase ?? new UpsertUserUseCase();
    this.replaceUserRolesUseCase =
      deps?.replaceUserRolesUseCase ?? new ReplaceUserRolesUseCase();
    this.replaceUserTeamsUseCase =
      deps?.replaceUserTeamsUseCase ?? new ReplaceUserTeamsUseCase();
    this.findAllUsersUseCase =
      deps?.findAllUsersUseCase ?? new FindAllUsersUseCase();
  }

  @Endpoint()
  async me(): Promise<ApiResponse> {
    const user =
      (await this.findUserInContextUseCase.execute()) as UserWithRolesPermissionsAndTeams;

    const response = ApiResponse.json(UserResponseMapper.toMeResponse(user), {
      status: constants.HTTP_STATUS_OK,
    });

    return response;
  }

  @Endpoint({
    module: ModuleEnum.USERS,
    permission: [PermissionSuffixEnum.ADD, PermissionSuffixEnum.EDIT],
  })
  async upsertUser(req: ApiRequest): Promise<ApiResponse> {
    const rawBody = await parseJSON(req);
    const body: UpserUserRequestBody = await validator(
      upserUserRequestBodySchema,
      rawBody,
    );

    const dto: UpsertUserDTO = UserMapper.toUpsertUserDTO(body);
    const user = await this.upsertUserUseCase.execute(dto);

    const response = ApiResponse.json(UserResponseMapper.toUserResponse(user), {
      status: constants.HTTP_STATUS_OK,
    });

    return response;
  }

  @Endpoint({
    module: ModuleEnum.USERS,
    permission: PermissionSuffixEnum.EDIT,
  })
  async replaceUserRoles(
    req: ApiRequest,
    { params }: ReplaceUserRolesParams,
  ): Promise<ApiResponse> {
    const rawBody = await parseJSON(req);
    const body: ReplaceUserRolesRequestBody = await validator(
      replaceUserRolesRequestBodySchema,
      rawBody,
    );

    const dto: ReplaceUserRolesDTO = UserMapper.toReplaceUserRolesDTO(body);
    dto.userUuid = params.uuid;

    const user = await this.replaceUserRolesUseCase.execute(dto);

    const response = ApiResponse.json(UserResponseMapper.toUserResponse(user), {
      status: constants.HTTP_STATUS_OK,
    });

    return response;
  }

  @Endpoint({
    module: ModuleEnum.USERS,
    permission: PermissionSuffixEnum.EDIT,
  })
  async replaceUserTeams(
    req: ApiRequest,
    { params }: ReplaceUserTeamsParams,
  ): Promise<ApiResponse> {
    const rawBody = await parseJSON(req);
    const body: ReplaceUserTeamsRequestBody = await validator(
      replaceUserTeamsRequestBodySchema,
      rawBody,
    );

    const dto: ReplaceUserTeamsDTO = UserMapper.toReplaceUserTeamsDTO(body);
    dto.userUuid = params.uuid;

    const user = await this.replaceUserTeamsUseCase.execute(dto);

    const response = ApiResponse.json(UserResponseMapper.toUserResponse(user), {
      status: constants.HTTP_STATUS_OK,
    });

    return response;
  }

  @Endpoint({
    module: ModuleEnum.USERS,
    permission: PermissionSuffixEnum.READ,
  })
  async findAllUsers(req: ApiRequest): Promise<ApiResponse> {
    const queryParams = req.nextUrl.searchParams;

    const dto = UserMapper.toFindAllUsersDTO(queryParams);

    const users = await this.findAllUsersUseCase.execute(dto);

    const response = ApiResponse.json(
      UserResponseMapper.toUserPaginatedResponse(users),
      {
        status: constants.HTTP_STATUS_OK,
      },
    );

    return response;
  }
}
