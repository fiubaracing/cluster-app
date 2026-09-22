import type { Permissions } from "@/api/roles/domain/models/permissions.model";
import { PermissionsResponse } from "../dtos/responses/permissions.response";

export class PermissionsResponseMapper {
  static toResponse(permissions: Permissions): PermissionsResponse {
    const response = new PermissionsResponse();
    response.permissions = permissions.permissions;
    return response;
  }
}
