import { NotFoundException } from "@/api/shared/infrastructure/exceptions/not-found.exception";

export class UserNotFoundException extends NotFoundException {
	constructor(email: string) {
		super(
			"User not found",
			`No user was found with the email address: ${email}`,
			"user-not-found",
			{ email },
		);
	}
}
