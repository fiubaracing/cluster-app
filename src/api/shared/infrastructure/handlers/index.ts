import { execFile as execFileNode } from "node:child_process";
import { promisify } from "node:util";
import type * as yup from "yup";
import type { Module } from "@/api/roles/domain/models/module.model";
import type { PermissionSuffix } from "@/api/roles/domain/models/permission.model";
import type { ApiRequest } from "@/api/shared/types/api";
import type { ApiHandler } from "../../types/api";
import { withAuthentication } from "./authentication";
import { withAuthorization } from "./authorization";
import { withErrorHandler } from "./exception";
import { withLogging } from "./tracing";

export const execFile = promisify(execFileNode);

export interface Middlewares {
  logging?: boolean;
  errorHandler?: boolean;
  auth?: boolean;
}

export interface EndpointOptions extends Middlewares {
  module?: Module;
  permission?: PermissionSuffix | PermissionSuffix[];
}

const wrapRequest = <T extends ApiHandler>(
  handler: T,
  {
    logging = true,
    errorHandler = true,
    auth = true,
    module = undefined,
    permission = undefined,
  }: EndpointOptions = {},
) => {
  let wrappedHandler: ApiHandler = function (
    this: unknown,
    req: ApiRequest,
    ...args: any[]
  ) {
    return handler.call(this, req, ...args);
  };

  if (module && permission)
    wrappedHandler = withAuthorization(wrappedHandler, module, permission);
  if (logging) wrappedHandler = withLogging(wrappedHandler);
  if (auth) wrappedHandler = withAuthentication(wrappedHandler);
  if (errorHandler) wrappedHandler = withErrorHandler(wrappedHandler);

  return wrappedHandler as T;
};

const createDecorator = (options: EndpointOptions = {}): MethodDecorator => {
  return (_target, _propertyKey, descriptor) => {
    const method = descriptor.value;
    if (typeof method === "function") {
      descriptor.value = wrapRequest(method as ApiHandler, options) as any;
    }
  };
};

export function Endpoint(options?: EndpointOptions): MethodDecorator;
export function Endpoint(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
): void;
export function Endpoint(...args: any[]) {
  if (args.length === 3) {
    return createDecorator()(args[0], args[1], args[2]);
  }

  return createDecorator(args[0] ?? {});
}

export const validator = async (
  schema: yup.ObjectSchema<any>,
  data: any,
): Promise<any> => {
  return await schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const parseJSON = async (req: ApiRequest): Promise<any> => {
  try {
    return await req.json();
  } catch (e) {
    return {};
  }
};
