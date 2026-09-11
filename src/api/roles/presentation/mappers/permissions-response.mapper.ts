import { PermissionsResponse } from "../dtos/responses/permissions.response";
import { Permissions } from "@/api/roles/domain/models/permissions.model";

export class PermissionsResponseMapper {
    static toResponse(permissions: Permissions): PermissionsResponse {
        const response = new PermissionsResponse();
        response.permissions = permissions.permissions;
        return response;
    }
}