import { UUID } from "@/api/shared/domain/models/uuid";

export interface RefreshTokenPayload {
	uuid: UUID;
	sessionId: string;
}
