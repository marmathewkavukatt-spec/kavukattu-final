import { NextRequest, NextResponse } from "next/server";

export async function securityMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return handler(request);
}

export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => handler(request);
}

export function withDbSecurity<T extends (...args: unknown[]) => unknown>(
  dbFunction: T
): T {
  return dbFunction;
}

export async function parseSecureJSON(request: NextRequest): Promise<unknown> {
  return request.json();
}

export async function parseSecureFormData(request: NextRequest): Promise<FormData> {
  return request.formData();
}

export function requireCSRF(request: NextRequest, sessionId: string): boolean {
  void request;
  void sessionId;
  return true;
}

export function validateContentType(
  request: NextRequest,
  allowedTypes: string[]
): boolean {
  void request;
  void allowedTypes;
  return true;
}

export function validateOrigin(request: NextRequest): boolean {
  void request;
  return true;
}

export interface SecurityAuditLog {
  timestamp: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  fingerprint: string;
  blocked: boolean;
  reason?: string;
}

const auditLogs: SecurityAuditLog[] = [];

export function addAuditLog(log: SecurityAuditLog) {
  auditLogs.push(log);
}

export function getAuditLogs(limit: number = 100): SecurityAuditLog[] {
  return auditLogs.slice(-limit);
}

export function getSecurityMetrics() {
  return {
    totalRequests: auditLogs.length,
    blockedRequests: 0,
    uniqueIPs: new Set(auditLogs.map((log) => log.ip)).size,
    averageResponseTime: 0,
    topPaths: [],
    suspiciousIPs: [],
  };
}
