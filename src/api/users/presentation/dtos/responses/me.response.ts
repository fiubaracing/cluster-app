import type { UUID } from "crypto";
import type { RoleType } from "@/api/roles/domain/models/role.model";
import type { PermissionsResponse } from "@/api/roles/presentation/dtos/responses/permissions.response";

export class MeResponse {
  uuid!: UUID;
  email!: string;
  name!: string;
  roles!: Set<RoleType>;
  permissions!: PermissionsResponse;
  teams!: Set<string>;
}
