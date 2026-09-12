import { Module } from "@/api/roles/domain/models/module.model";
import { PermissionSuffix } from "@/api/roles/domain/models/permission.model";
import { UUID } from "@/api/shared/domain/models/uuid";

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
