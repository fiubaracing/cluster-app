import type { Module } from "@/api/roles/domain/models/module.model";
import type { PermissionSuffix } from "@/api/roles/domain/models/permission.model";
import type { ApiRequest } from "@/api/shared/types/api";
import type { ApiHandler } from "../../types/api";
import context from "../config/store";
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
