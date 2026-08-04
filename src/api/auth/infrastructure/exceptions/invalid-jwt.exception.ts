import { ApiExceptionArgs } from "@/api/shared/infrastructure/exceptions/api.exception";
import { UnauthorizedException } from "@/api/shared/infrastructure/exceptions/unauthorized.exception";

export class InvalidJWTException extends UnauthorizedException {
	private constructor(
		title: string,
		detail: string,
		errorCode: string,
		errorArgs?: ApiExceptionArgs,
	) {
		super(title, detail, errorCode, errorArgs);
	}

	static fromBlank() {
		return new InvalidJWTException(
			"Blank JWT",
			"The provided JWT is blank. Please provide a valid token.",
			"jwt.blank",
		);
	}

	static fromInvalid() {
		return new InvalidJWTException(
			"Invalid JWT",
			"The provided JWT is invalid. Please ensure that the token is correct and try again.",
			"jwt.invalid",
		);
	}

	static fromExpired() {
		return new InvalidJWTException(
			"Expired JWT",
			"The provided JWT has expired. Please obtain a new token and try again.",
			"jwt.expired",
		);
	}

	static fromUnknown() {
		return new InvalidJWTException(
			"Unknown JWT Error",
			"An unknown error occurred while processing the JWT. Please try again later.",
			"jwt.unknown",
		);
	}
}
