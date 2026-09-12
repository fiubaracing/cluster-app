import { ApiExceptionArgs } from "@/api/shared/infrastructure/exceptions/api.exception";
import { NotFoundException } from "@/api/shared/infrastructure/exceptions/not-found.exception";
import { UUID } from "crypto";

export class TeamNotFoundException extends NotFoundException {
    private constructor(
        title: string,
        detail: string,
        errorCode: string,
        errorArgs?: ApiExceptionArgs,
    ) {
        super(title, detail, errorCode, errorArgs);
    }

    static fromUuid(uuid: UUID) {
        return new TeamNotFoundException(
            "Team not found",
            `No team was found with the UUID: ${uuid}`,
            "team-not-found",
            { uuid },
        );
    }

    static fromUuids(uuids: UUID[]) {
        return new TeamNotFoundException(
            "Teams not found",
            `No teams were found with the UUIDs: ${uuids.join(", ")}`,
            "teams-not-found",
            { uuids },
        );
    }
}
