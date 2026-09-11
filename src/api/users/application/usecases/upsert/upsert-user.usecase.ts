import { User, UserWithCreator } from "@/api/users/domain/models/user.model";
import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import { ActiveState } from "@/api/shared/domain/enums/active-state";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserRepositoryImpl } from "../../../infrastructure/adapters/user.repository-impl";
import { UpsertUserDTO } from "../../dtos/upsert-user.dto";
import { ValidateAccessUseCase } from "@/api/auth/application/usecases/validate/validate-access.usecase";
import { ValidateItemAccessDTO } from "@/api/auth/application/dtos/validate-access.dto";
import { ModuleEnum } from "@/api/roles/domain/models/module.model";
import { PermissionSuffixEnum } from "@/api/roles/domain/models/permission.model";

interface UpsertUserUseCaseDependencies {
	userRepository?: UserRepository;
	validateAccessUseCase?: ValidateAccessUseCase;
}

export class UpsertUserUseCase {
	private readonly userRepository: UserRepository;
	private readonly validateAccessUseCase: ValidateAccessUseCase;

	constructor(deps?: UpsertUserUseCaseDependencies) {
		this.userRepository = deps?.userRepository ?? new UserRepositoryImpl();
		this.validateAccessUseCase =
			deps?.validateAccessUseCase ?? new ValidateAccessUseCase();
	}

	/**
	 * Executes the use case to find a shallow user by their email address.
	 * @param email - The email address of the user to find.
	 * @returns A promise that resolves to the User object if found, or throws a UserNotFoundException if not found.
	 * @throws UserNotFoundException if no user is found with the provided email address.
	 */
	async execute(dto: UpsertUserDTO): Promise<User> {
		logger.info(
			`Use case UpsertUserUseCase started for email: ${dto.email}`,
		);

		const user =
			await this.userRepository.findShallowByEmailAndStateWithCreator(
				dto.email,
				ActiveState.ACTIVE,
			);

		const upsertedUser =
			!user ?
				await this.createUser(dto)
			:	await this.updateUser(user, dto);

		logger.info("Use case UpsertUserUseCase completed successfully");

		return upsertedUser;
	}

	private async createUser(dto: UpsertUserDTO): Promise<User> {
		const validateDto = new ValidateItemAccessDTO();
		validateDto.module = ModuleEnum.USERS;
		validateDto.permission = PermissionSuffixEnum.ADD;

		this.validateAccessUseCase.execute(validateDto);

		return await this.userRepository.create(dto);
	}

	private async updateUser(
		user: UserWithCreator,
		dto: UpsertUserDTO,
	): Promise<User> {
		const validateDto = new ValidateItemAccessDTO();
		validateDto.module = ModuleEnum.USERS;
		validateDto.permission = PermissionSuffixEnum.EDIT;
		validateDto.ownerUuid =
			user.createdBy ? user.createdBy.uuid : undefined;

		this.validateAccessUseCase.execute(validateDto);

		return await this.userRepository.update(dto);
	}
}
