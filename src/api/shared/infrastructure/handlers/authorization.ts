import { ApiHandler } from "../../types/api";
import context from "../config/store";
import { ApiRequest } from "@/api/shared/types/api";
import { Module } from "@/api/roles/domain/models/module.model";
import { PermissionSuffix } from "@/api/roles/domain/models/permission.model";
import { ForbiddenException } from "../exceptions/forbidden.exception";

export function withAuthorization(
    handler: ApiHandler,
    module: Module,
    permission: PermissionSuffix | PermissionSuffix[],
) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    const hasPermission = permissions.some((perm) =>
        context.store.user.permissions.hasSuffix(module, perm),
    );

    if (!hasPermission) {
        throw new ForbiddenException(
            `Forbidden`,
            `User does not have permission ${permission} for module ${module}`,
        );
    }

    return async function (this: unknown, req: ApiRequest, ...args: any[]) {
        return await handler.call(this, req, ...args);
    };
}
