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

interface UserControllerDependencies {
	findUserInContextUseCase?: FindUserInContextUseCase;
	upsertUserUseCase: UpsertUserUseCase;
}

export default class UserController {
	private readonly findUserInContextUseCase: FindUserInContextUseCase;
	private readonly upsertUserUseCase: UpsertUserUseCase;

	constructor(deps?: UserControllerDependencies) {
		this.findUserInContextUseCase =
			deps?.findUserInContextUseCase ?? new FindUserInContextUseCase();
		this.upsertUserUseCase =
			deps?.upsertUserUseCase ?? new UpsertUserUseCase();
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
		permission: PermissionSuffixEnum.EDIT,
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
}
