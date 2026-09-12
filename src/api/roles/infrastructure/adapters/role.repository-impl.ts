import { UUID } from "crypto";
import { RoleRepository } from "@/api/roles/domain/repositories/role.repository";
import { Role } from "@/api/roles/domain/models/role.model";
import { logger } from "@/api/shared/infrastructure/config/logger";
import { RoleDrizzleRepository } from "@/api/roles/infrastructure/repositories/role.drizzle.repository";
import { RoleEntityMapper } from "@/api/roles/infrastructure/adapters/mappers/role-entity.mapper";

export class RoleRepositoryImpl implements RoleRepository {
    async findByUuidIn(uuids: UUID[]): Promise<Role[]> {
        logger.info(
            `Finding roles by UUIDs: ${uuids.length > 0 ? uuids.join(", ") : "No UUIDs provided"}`,
        );

        return RoleEntityMapper.toDomainArray(
            await RoleDrizzleRepository.findByUuidIn(uuids),
        );
    }
}