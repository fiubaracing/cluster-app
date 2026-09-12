import { UUID } from "crypto";
import * as yup from "yup";

export const replaceUserTeamsRequestBodySchema = yup.object({
    teamUuids: yup
        .array()
        .of(
            yup
                .string<UUID>()
                .uuid("Each teamUuid must be a valid UUID")
                .required("Each teamUuid is required"),
        )
        .required("teamUuids is required")
        .nonNullable("teamUuids cannot be null")
        .min(1, "teamUuids must contain at least one role UUID"),
});

export type ReplaceUserTeamsRequestBody = yup.InferType<
    typeof replaceUserTeamsRequestBodySchema
>;

export interface ReplaceUserTeamsParams {
    params: {
        uuid: UUID;
    }
}