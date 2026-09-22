import type { UUID } from "crypto";
import type { Role } from "@/api/roles/domain/models/role.model";
import type { RoleRepository } from "@/api/roles/domain/repositories/role.repository";
import { RoleEntityMapper } from "@/api/roles/infrastructure/adapters/mappers/role-entity.mapper";
import { RoleDrizzleRepository } from "@/api/roles/infrastructure/repositories/role.drizzle.repository";
import { logger } from "@/api/shared/infrastructure/config/logger";

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
