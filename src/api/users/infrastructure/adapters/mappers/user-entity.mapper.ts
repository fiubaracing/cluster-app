import { UserEntity } from "@/api/users/infrastructure/entities/user.entity";
import { User } from "@/api/users/domain/models/user.model";

export class UserEntityMapper {
    static mapToDomainShallow(entity: UserEntity | null): User | null {
        if (!entity) {
            return null;
        }

        const user = new User();
        user.uuid = entity.uuid;
        user.email = entity.email;
        user.name = entity.name;
        return user;
    }
} 