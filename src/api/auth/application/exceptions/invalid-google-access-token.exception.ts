import { ApiExceptionArgs } from "@/api/shared/infrastructure/exceptions/api.exception";
import { UnauthorizedException } from "@/api/shared/infrastructure/exceptions/unauthorized.exception";

export class InvalidGoogleAccessTokenException extends UnauthorizedException {
	private constructor(
		title: string,
		detail: string,
		errorCode: string,
		errorArgs?: ApiExceptionArgs,
	) {
		super(title, detail, errorCode, errorArgs);
	}

	static fromInvalidToken() {
		return new InvalidGoogleAccessTokenException(
			"Invalid or expired Google access token",
			"The provided Google access token is either invalid or has expired. Please obtain a new access token and try again.",
			"invalid-google-access-token",
		);
	}

	static fromInvalidEmailVerification() {
		return new InvalidGoogleAccessTokenException(
			"Email address not verified by Google",
			`The email address associated with the provided Google access token has not been verified. 
            Please verify your email address with Google and try again.`,
			"invalid-google-email-verification",
		);
	}
}
