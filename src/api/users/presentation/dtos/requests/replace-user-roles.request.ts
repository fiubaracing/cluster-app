import { UUID } from "crypto";
import * as yup from "yup";

export const replaceUserRolesRequestBodySchema = yup.object({
	roleUuids: yup
		.array()
		.of(
			yup
				.string<UUID>()
				.uuid("Each roleUuid must be a valid UUID")
				.required("Each roleUuid is required"),
		)
		.required("roleUuids is required")
		.nonNullable("roleUuids cannot be null")
		.min(1, "roleUuids must contain at least one role UUID"),
});

export type ReplaceUserRolesRequestBody = yup.InferType<
	typeof replaceUserRolesRequestBodySchema
>;

export interface ReplaceUserRolesParams {
    params: {
        uuid: UUID;
    }
}