import { logger } from "@/api/shared/infrastructure/config/logger";
import { UUID } from "crypto";
import { Role } from "@/api/roles/domain/models/role.model";
import { RoleRepository } from "@/api/roles/domain/repositories/role.repository";
import { RoleRepositoryImpl } from "@/api/roles/infrastructure/adapters/role.repository-impl";
import { RoleNotFoundException } from "@/api/roles/application/exceptions/role-not-found.exception";

interface FindRolesUseCaseDependencies {
    roleRepository?: RoleRepository;
}

export class FindRolesUseCase {
    private readonly roleRepository: RoleRepository;

    constructor(deps?: FindRolesUseCaseDependencies) {
        this.roleRepository = deps?.roleRepository ?? new RoleRepositoryImpl();
    }

    /**
     * Executes the use case to find roles by their UUIDs.
     * @param uuids - An array of UUIDs representing the roles to find.
     * @returns A promise that resolves to an array of Role objects if found, or an empty array if not found.
     * @throws {RoleNotFoundException} if any of the provided role UUIDs do not exist.
     */
    async execute(uuids: UUID[]): Promise<Role[]> {
        logger.info(
            `Use case FindRolesUseCase started for uuids: ${uuids.join(", ")}`,
        );

        const roles = await this.roleRepository.findByUuidIn(uuids);

        if (roles.length !== uuids.length) {
            const foundUuids = roles.map((role) => role.uuid);
            const notFoundUuids = uuids.filter(
                (uuid) => !foundUuids.includes(uuid),
            );
            throw RoleNotFoundException.fromUuids(notFoundUuids);
        }

        logger.info("Use case FindRolesUseCase completed successfully");

        return roles;
    }
}
