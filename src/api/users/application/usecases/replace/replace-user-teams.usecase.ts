import {
    UserWithCreator,
    UserWithRolesPermissionsAndTeams,
} from "@/api/users/domain/models/user.model";
import { UserRepository } from "@/api/users/domain/repositories/user.repository";
import { ActiveState } from "@/api/shared/domain/enums/active-state";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { UserRepositoryImpl } from "../../../infrastructure/adapters/user.repository-impl";
import { ValidateAccessUseCase } from "@/api/auth/application/usecases/validate/validate-access.usecase";
import { ValidateItemAccessDTO } from "@/api/auth/application/dtos/validate-access.dto";
import { ModuleEnum } from "@/api/roles/domain/models/module.model";
import { PermissionSuffixEnum } from "@/api/roles/domain/models/permission.model";
import { ReplaceUserTeamsDTO } from "@/api/users/application/dtos/replace-user-teams.dto";
import { UserNotFoundException } from "../../exceptions/user-not-found.exception";
import { UUID } from "crypto";
import { FindTeamsUseCase } from "@/api/teams/application/usecases/find/find-teams.usecase";

interface ReplaceUserTeamsUseCaseDependencies {
    userRepository?: UserRepository;
    validateAccessUseCase?: ValidateAccessUseCase;
    findTeamsUseCase?: FindTeamsUseCase;
}

export class ReplaceUserTeamsUseCase {
    private readonly userRepository: UserRepository;
    private readonly validateAccessUseCase: ValidateAccessUseCase;
    private readonly findTeamsUseCase: FindTeamsUseCase;

    constructor(deps?: ReplaceUserTeamsUseCaseDependencies) {
        this.userRepository = deps?.userRepository ?? new UserRepositoryImpl();
        this.validateAccessUseCase =
            deps?.validateAccessUseCase ?? new ValidateAccessUseCase();
        this.findTeamsUseCase = deps?.findTeamsUseCase ?? new FindTeamsUseCase();
    }

    /**
     * Executes the use case to find a shallow user by their email address.
     * @param email - The email address of the user to find.
     * @returns A promise that resolves to the User object if found, or throws a UserNotFoundException if not found.
     * @throws {UserNotFoundException} if no user is found with the provided email address.
     * @throws {RoleNotFoundException} if any of the provided role UUIDs do not exist.
     * @throws {ForbiddenException} if the user does not have the required access to replace Teams for the specified user.
     * @returns A promise that resolves to the updated User object with the new Teams.
     */
    async execute(
        dto: ReplaceUserTeamsDTO,
    ): Promise<UserWithRolesPermissionsAndTeams> {
        logger.info(
            `Use case ReplaceUserTeamsUseCase started for user with uuid: ${dto.userUuid}`,
        );

        this.validateDtoOrThrow(dto);
        
        const updatedUser = await this.userRepository.replaceTeams(
            dto.userUuid,
            dto.teamUuids,
        );
        
        logger.info("Use case ReplaceUserTeamsUseCase completed successfully");
        
        return updatedUser;
    }
    
    private async validateDtoOrThrow(dto: ReplaceUserTeamsDTO): Promise<void> {
        const user = await this.validateUserExistsOrThrow(dto.userUuid);
        await this.validateTeamsExistOrThrow(dto.teamUuids);
        await this.validateAccess(user);
    }
    
    private async validateUserExistsOrThrow(userUuid: UUID): Promise<UserWithCreator> {
        const user =
            await this.userRepository.findShallowByUuidAndStateWithCreator(
                userUuid,
                ActiveState.ACTIVE,
            );
        if (!user) {
            throw UserNotFoundException.fromUuid(userUuid);
        }

        return user;
    }

    private async validateTeamsExistOrThrow(teamUuids: UUID[]): Promise<void> {
        this.findTeamsUseCase.execute(teamUuids);
    }

    private async validateAccess(user: UserWithCreator): Promise<void> {
        const validateDto = new ValidateItemAccessDTO();
        validateDto.module = ModuleEnum.USERS;
        validateDto.permission = PermissionSuffixEnum.EDIT;
        validateDto.ownerUuid = user.createdBy ? user.createdBy.uuid : undefined;

        await this.validateAccessUseCase.execute(validateDto);
    }
}
