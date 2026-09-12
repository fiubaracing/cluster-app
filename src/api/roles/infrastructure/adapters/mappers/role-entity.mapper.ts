import { Role, RoleType } from "@/api/roles/domain/models/role.model";
import { RoleEntity } from "@/api/roles/infrastructure/entities/role.entity";

export class RoleEntityMapper {
    static toDomain(entity: RoleEntity): Role {
        const role = new Role();
        role.uuid = entity.uuid;
        role.name = entity.name as RoleType;
        role.description = entity.description;
        return role;
    }

    static toDomainArray(entities: RoleEntity[]): Role[] {
        return entities.map((entity) => this.toDomain(entity));
    }
}