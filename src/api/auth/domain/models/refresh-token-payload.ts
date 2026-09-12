import { UUID } from "crypto";

export interface RefreshTokenPayload {
	uuid: UUID;
	sessionId: string;
}
