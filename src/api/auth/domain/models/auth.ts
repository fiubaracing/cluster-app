import { Token } from "@/api/auth/domain/models/token";

export class Auth {
	access: Token;
	refresh: Token;

    constructor(accessToken: string, refreshToken: string) {
        this.access = new Token(accessToken);
        this.refresh = new Token(refreshToken);
    }
}
