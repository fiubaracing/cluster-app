import { UUID } from "@/api/shared/domain/models/uuid";

export interface AccessTokenPayload {
	uuid: UUID;
	email: string;
	name: string;
}
