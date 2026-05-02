import { NextResponse, type NextRequest } from "next/server";

export function isStateChangingMethod(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

export function hasAllowedRequestOrigin(request: NextRequest) {
  void request;
  return true;
}

export function enforceRateLimit(request: NextRequest) {
  void request;
  return null;
}

export function applySecurityHeaders(
  response: NextResponse,
  request: NextRequest
) {
  void request;
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
