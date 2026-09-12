import { ActiveStateType } from "@/api/shared/domain/enums/active-state";
import { UserEntity } from "@/api/users/infrastructure/entities/user.entity";
import { UUID } from "crypto";

export class TeamEntity {
    id!: number;
    uuid!: UUID;
    name!: string;
    description!: string | null;
    state!: ActiveStateType;
    createdAt!: Date | null;
    createdBy!: number | null;
    updatedAt!: Date | null;
    updatedBy!: number | null;
    deactivatedAt!: Date | null;
    deactivatedBy!: number | null;
}

export type TeamEntityWithCreator = Omit<TeamEntity, "createdBy"> & {
    createdBy: UserEntity | null;
};