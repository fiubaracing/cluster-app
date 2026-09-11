import { Module } from "@/api/roles/domain/models/module.model";
import { Permission, PermissionSuffix } from "@/api/roles/domain/models/permission.model";

export class PermissionsResponse {
    permissions!: Map<Module, Set<Permission>>;
}