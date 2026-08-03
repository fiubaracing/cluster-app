import { ApiException } from "../exceptions/api.exception";
import { InternalServerErrorException } from "../exceptions/internal-server-error.exception";
import { ApiHandler } from "../../types/api";
import { TRACE_HEADER } from "../consts/header";
import { ValidationError } from "yup";
import { BadRequestException } from "../exceptions/bad-request.exception";
import { ApiRequest, ApiResponse } from "@/api/shared/types/api";

export function withErrorHandler(handler: ApiHandler) {
	return async function (this: unknown, req: ApiRequest, ...args: any[]) {
		try {
			return await handler.call(this, req, ...args);
		} catch (e) {
			const error = castError(e);
			error.instance = req.method + " " + req.url;
			error.extensions.traceId = req.headers.get(TRACE_HEADER) as string;

			console.error("API Error", error);

			return mapResponse(error);
		}
	};
}

const castError = (e: unknown): ApiException => {
	if (e instanceof ApiException) {
		return e;
	} else if (e instanceof ValidationError) {
		const fieldErrors = extractFieldErrors(e);

		return new BadRequestException(
			"Body validation error",
			"One or more fields failed validation.",
			"validation",
			{ ...fieldErrors },
		);
	} else {
		return new InternalServerErrorException(e as Error);
	}
};

const extractFieldErrors = (error: ValidationError): Record<string, string> => {
	const fieldErrors: Record<string, string> = {};

	if (error.inner.length > 0) {
		error.inner.forEach((err) => {
			if (err.path) fieldErrors[err.path] = err.message;
		});
	} else if (error.path) {
		fieldErrors[error.path] = error.message;
	} else if (error.errors.length > 0) {
		fieldErrors.body = error.errors[0];
	}

	return fieldErrors;
};


const mapResponse = (e: ApiException): ApiResponse => {
	return new ApiResponse(JSON.stringify(e), { status: e.status.valueOf() });
};
