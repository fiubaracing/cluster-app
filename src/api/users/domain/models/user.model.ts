import { ActiveStateType } from "@/api/shared/domain/enums/active-state";

export class User {
    uuid!: string;
    email!: string;
    name!: string;
    state?: ActiveStateType;
    createdAt?: Date | null;
    createdBy?: number | null;
    updatedAt?: Date | null;
    updatedBy?: number | null;
    deactivatedAt?: Date | null;
    deactivatedBy?: number | null;
}