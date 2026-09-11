import { RoleType } from "@/api/roles/domain/models/role.model";
import { PermissionsResponse } from "@/api/roles/presentation/dtos/responses/permissions.response";
import { ActiveStateType } from "@/api/shared/domain/enums/active-state";

export class MeResponse {
    uuid!: string;
    email!: string;
    name!: string;
    roles!: Set<RoleType>;
    permissions!: PermissionsResponse;
    teams!: Set<string>;
}