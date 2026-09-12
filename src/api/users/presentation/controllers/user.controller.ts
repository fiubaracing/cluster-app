import {
	Endpoint,
	parseJSON,
	validator,
} from "@/api/shared/infrastructure/handlers";
import { ApiRequest, ApiResponse } from "@/api/shared/types/api";
import { constants } from "http2";
import { FindUserInContextUseCase } from "@/api/users/application/usecases/find/find-user-in-context.usecase";
import { UserWithRolesPermissionsAndTeams } from "@/api/users/domain/models/user.model";
import { UserResponseMapper } from "@/api/users/presentation/mappers/user-response.mapper";
import { PermissionSuffixEnum } from "@/api/roles/domain/models/permission.model";
import { ModuleEnum } from "@/api/roles/domain/models/module.model";
import { UpsertUserUseCase } from "@/api/users/application/usecases/upsert/upsert-user.usecase";
import {
	UpserUserRequestBody,
	upserUserRequestBodySchema,
} from "../dtos/requests/upsert-user.request";
import { UserMapper } from "../../application/mappers/user.mapper";
import { UpsertUserDTO } from "../../application/dtos/upsert-user.dto";
import { ReplaceUserRolesDTO } from "../../application/dtos/replace-user-roles.dto";
import { ReplaceUserRolesParams, ReplaceUserRolesRequestBody, replaceUserRolesRequestBodySchema } from "../dtos/requests/replace-user-roles.request";
import { ReplaceUserRolesUseCase } from "../../application/usecases/replace/replace-user-roles.usecase";

interface UserControllerDependencies {
	findUserInContextUseCase?: FindUserInContextUseCase;
	upsertUserUseCase: UpsertUserUseCase;
	replaceUserRolesUseCase: ReplaceUserRolesUseCase;
}

export default class UserController {
	private readonly findUserInContextUseCase: FindUserInContextUseCase;
	private readonly upsertUserUseCase: UpsertUserUseCase;
	private readonly replaceUserRolesUseCase: ReplaceUserRolesUseCase;

	constructor(deps?: UserControllerDependencies) {
		this.findUserInContextUseCase =
			deps?.findUserInContextUseCase ?? new FindUserInContextUseCase();
		this.upsertUserUseCase =
			deps?.upsertUserUseCase ?? new UpsertUserUseCase();
		this.replaceUserRolesUseCase =
			deps?.replaceUserRolesUseCase ?? new ReplaceUserRolesUseCase();
	}

	@Endpoint()
	async me(): Promise<ApiResponse> {
		const user =
			(await this.findUserInContextUseCase.execute()) as UserWithRolesPermissionsAndTeams;

		const response = ApiResponse.json(
			UserResponseMapper.toMeResponse(user),
			{
				status: constants.HTTP_STATUS_OK,
			},
		);

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

		const response = ApiResponse.json(
			UserResponseMapper.toUserResponse(user),
			{
				status: constants.HTTP_STATUS_OK,
			},
		);

		return response;
	}

	@Endpoint({
		module: ModuleEnum.USERS,
		permission: PermissionSuffixEnum.EDIT,
	})
	async replaceUserRoles(req: ApiRequest, { params }: ReplaceUserRolesParams): Promise<ApiResponse> {
		const rawBody = await parseJSON(req);
		const body: ReplaceUserRolesRequestBody = await validator(
			replaceUserRolesRequestBodySchema,
			rawBody,
		);

		const dto: ReplaceUserRolesDTO =
			UserMapper.toReplaceUserRolesDTO(body);
		dto.userUuid = params.uuid;

		const user = await this.replaceUserRolesUseCase.execute(dto);

		const response = ApiResponse.json(
			UserResponseMapper.toUserResponse(user),
			{
				status: constants.HTTP_STATUS_OK,
			},
		);

		return response;
	}
}
