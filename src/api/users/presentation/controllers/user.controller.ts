import { Endpoint } from "@/api/shared/infrastructure/handlers";
import { ApiRequest, ApiResponse } from "@/api/shared/types/api";
import { constants } from "http2";
import { FindUserInContextUseCase } from "../../application/usecases/find/find-user-in-context.usecase";
import { UserWithRolesPermissionsAndTeams } from "../../domain/models/user.model";
import { UserResponseMapper } from "@/api/users/presentation/mappers/user-response.mapper";

interface UserControllerDependencies {
	findUserInContextUseCase?: FindUserInContextUseCase;
}

export default class UserController {
	private readonly findUserInContextUseCase: FindUserInContextUseCase;

	constructor(deps?: UserControllerDependencies) {
		this.findUserInContextUseCase =
			deps?.findUserInContextUseCase ?? new FindUserInContextUseCase();
	}

	@Endpoint()
	async me() {
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
}
