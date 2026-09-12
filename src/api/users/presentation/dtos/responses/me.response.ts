import { RoleType } from "@/api/roles/domain/models/role.model";
import { PermissionsResponse } from "@/api/roles/presentation/dtos/responses/permissions.response";
import { UUID } from "@/api/shared/domain/models/uuid";

export class MeResponse {
	uuid!: UUID;
	email!: string;
	name!: string;
	roles!: Set<RoleType>;
	permissions!: PermissionsResponse;
	teams!: Set<string>;
}
