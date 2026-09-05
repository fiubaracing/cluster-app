import { BadRequestException } from "@/api/shared/infrastructure/exceptions/bad-request.exception";

export class BlankTokenException extends BadRequestException {
	constructor(title: string, detail: string, errorCode: string) {
		super(title, detail, errorCode);
	}

	static fromAccessToken() {
		return new BlankTokenException(
			"Blank Access Token",
			"The provided access token is blank. Please login again or use refresh token.",
			"jwt.blank.access",
		);
	}

	static fromRefreshToken() {
		return new BlankTokenException(
			"Blank Refresh Token",
			"The provided refresh token is blank. Please login again.",
			"jwt.blank.refresh",
		);
	}
}
