import { ApiExceptionArgs } from "@/api/shared/infrastructure/exceptions/api.exception";
import { NotFoundException } from "@/api/shared/infrastructure/exceptions/not-found.exception";

export class UserNotFoundException extends NotFoundException {
	private constructor(
		title: string,
		detail: string,
		errorCode: string,
		errorArgs?: ApiExceptionArgs,
	) {
		super(title, detail, errorCode, errorArgs);
	}

	static fromEmail(email: string) {
		return new UserNotFoundException(
			"User not found",
			`No user was found with the email address: ${email}`,
			"user-not-found",
			{ email },
		);
	}

	static fromUuid(uuid: string) {
		return new UserNotFoundException(
			"User not found",
			`No user was found with the UUID: ${uuid}`,
			"user-not-found",
			{ uuid },
		);
	}
}
