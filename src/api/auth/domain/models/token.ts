export class Token {
	tokenId!: string;
	token!: string;

    constructor(token: string) {
        this.tokenId = crypto.randomUUID();
        this.token = token;
    }
}
