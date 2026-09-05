import { Module } from "./module.model";
import { Permission, PermissionSuffix } from "./permission.model";

export class Permissions {
    permissions!: Map<Module, Set<Permission>>;

    constructor(permissions: Map<Module, Set<Permission>>) {
        this.permissions = permissions;
    }

    has(module: Module, permission: Permission): boolean {
        const modulePermissions = this.permissions.get(module);
        return modulePermissions ? modulePermissions.has(permission) : false;
    }

    hasSuffix(module: Module, permissions: PermissionSuffix): boolean {
        const modulePermissions = this.permissions.get(module);
        if (!modulePermissions) {
            return false;
        }

        for (const permission of modulePermissions) {
            if (permission.endsWith(permissions)) {
                return true;
            }
        }

        return false;
    }
}