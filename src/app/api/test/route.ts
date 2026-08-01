import BadRequestException from "../../../api/shared/exceptions/bad-request.exception";
import { buildRequest } from "../../../api/shared/handlers";
import { logger } from "../../../api/shared/config/logger";

async function handler(req: Request, res: Response) {
	logger.info("This is a test log message from the API route.");

	logger.info("This is another test log message after a delay.");

	throw new BadRequestException(
		"Bad Request",
		"This is a bad request example.",
		"BAD_REQUEST_EXAMPLE",
	);

	return Response.json({ message: "This is a test API route." });
}

export const GET = buildRequest(handler);
