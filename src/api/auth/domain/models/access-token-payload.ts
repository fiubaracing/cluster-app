import { UUID } from "crypto";

export interface AccessTokenPayload {
	uuid: UUID;
	email: string;
	name: string;
}
