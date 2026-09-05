import { AccessTokenPayload } from "@/api/auth/domain/models/access-token-payload";
import { NextRequest, NextResponse } from "next/server";

export type ApiHandler = (
  req: ApiRequest,
  ...args: any[]
) => Promise<ApiResponse> | ApiResponse;

export class ApiRequest extends NextRequest {
  context?: AccessTokenPayload;
}

export class ApiResponse extends NextResponse {}
