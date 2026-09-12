import { ApiExceptionArgs } from "@/api/shared/infrastructure/exceptions/api.exception";
import { NotFoundException } from "@/api/shared/infrastructure/exceptions/not-found.exception";
import { UUID } from "crypto";

export class RoleNotFoundException extends NotFoundException {
    private constructor(
        title: string,
        detail: string,
        errorCode: string,
        errorArgs?: ApiExceptionArgs,
    ) {
        super(title, detail, errorCode, errorArgs);
    }

    static fromUuid(uuid: UUID) {
        return new RoleNotFoundException(
            "Role not found",
            `No role was found with the UUID: ${uuid}`,
            "role-not-found",
            { uuid },
        );
    }

    static fromUuids(uuids: UUID[]) {
        return new RoleNotFoundException(
            "Roles not found",
            `No roles were found with the UUIDs: ${uuids.join(", ")}`,
            "roles-not-found",
            { uuids },
        );
    }
}
