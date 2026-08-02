import { UnauthorizedException } from "@/api/shared/infrastructure/exceptions/unauthorized.exception";

export class InvalidEmailAccessException extends UnauthorizedException {
	constructor(email: string) {
		super(
			"Email address unauthorized",
			`The email address associated with the provided Google access token is not authorized to access this application. 
            Please contact the administrator for access.`,
			"invalid-email-access",
			{ email },
		);
	}
}
