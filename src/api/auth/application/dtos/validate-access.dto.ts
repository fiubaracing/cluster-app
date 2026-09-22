import type { UUID } from "crypto";
import type { Module } from "@/api/roles/domain/models/module.model";
import type { PermissionSuffix } from "@/api/roles/domain/models/permission.model";

export class ValidateItemAccessDTO {
  module!: Module;
  permission!: PermissionSuffix;
  ownerUuid?: UUID;
  ownerTeamUuid?: UUID;
}

export class ValidateItemAccessBulkDTO {
  module!: Module;
  permission!: PermissionSuffix;
  ownerUuids?: UUID[];
  ownerTeamUuids?: UUID[];
}
