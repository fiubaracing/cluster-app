import { Module } from "@/api/roles/domain/models/module.model";
import { PermissionSuffix } from "@/api/roles/domain/models/permission.model";

export class ValidateItemAccessDTO {
	module!: Module;
	permission!: PermissionSuffix;
	ownerUuid?: string;
	ownerTeamUuid?: string;
}

export class ValidateItemAccessBulkDTO {
	module!: Module;
	permission!: PermissionSuffix;
	ownerUuids?: string[];
	ownerTeamUuids?: string[];
}
