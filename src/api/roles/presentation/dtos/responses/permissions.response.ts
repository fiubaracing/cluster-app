import type { Module } from "@/api/roles/domain/models/module.model";
import {
  type Permission,
  PermissionSuffix,
} from "@/api/roles/domain/models/permission.model";

export class PermissionsResponse {
  permissions!: Map<Module, Set<Permission>>;
}
