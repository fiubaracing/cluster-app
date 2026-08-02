import { Token } from "@/api/auth/domain/models/token";

export class AuthResponse {
	access!: Token;
	refresh!: Token;
}
