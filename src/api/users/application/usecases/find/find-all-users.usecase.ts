import { GenerateDataScopeUseCase } from "@/api/auth/application/usecases/generate/generate-data-scope.usecase";
import { ModuleEnum } from "@/api/roles/domain/models/module.model";
import type { Paginated } from "@/api/shared/domain/models/paginated.model";
import { logger } from "@/api/shared/infrastructure/config/logger";
import type { User } from "@/api/users/domain/models/user.model";
import type { UserRepository } from "@/api/users/domain/repositories/user.repository";
import { UserRepositoryImpl } from "../../../infrastructure/adapters/user.repository-impl";
import type { FindAllUsersDTO } from "../../dtos/find-all-users.dto";

interface FindAllUsersUseCaseDependencies {
  userRepository?: UserRepository;
  generateDataScope?: GenerateDataScopeUseCase;
}

export class FindAllUsersUseCase {
  private readonly userRepository: UserRepository;
  private readonly generateDataScope: GenerateDataScopeUseCase;

  constructor(deps?: FindAllUsersUseCaseDependencies) {
    this.userRepository = deps?.userRepository ?? new UserRepositoryImpl();
    this.generateDataScope =
      deps?.generateDataScope ?? new GenerateDataScopeUseCase();
  }

  /**
   * Executes the use case to find all users based on the provided DTO.
   * @param dto - The DTO containing the search criteria and pagination information.
   * @returns A promise that resolves to a paginated list of User objects.
   */
  async execute(dto: FindAllUsersDTO): Promise<Paginated<User>> {
    logger.info(`Use case FindAllUsersUseCase started`);

    dto.dataScope = await this.generateDataScope.execute(ModuleEnum.USERS);

    const users = await this.userRepository.findAll(dto);

    logger.info("Use case FindAllUsersUseCase completed successfully");

    return users;
  }
}
