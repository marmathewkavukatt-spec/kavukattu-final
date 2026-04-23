import { NextRequest, NextResponse } from "next/server";
import {
  detectBot,
  detectHoneypot,
  enhancedRateLimit,
  generateRequestFingerprint,
  getEnhancedSecurityHeaders,
  isAdminIPAllowed,
  logSecurityEvent,
  validateRequestSize,
  sanitizeDbQuery
} from "./security-enhanced";
import { getClientIP } from "./rateLimit";

// Security middleware for API routes
export async function securityMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // 1. Request size validation
    if (!validateRequestSize(request, 10 * 1024 * 1024)) { // 10MB limit
      logSecurityEvent(request, 'REQUEST_TOO_LARGE', path, false, { size: request.headers.get('content-length') });
      return createSecurityResponse('Request too large', 413);
    }

    // 2. Bot detection (allow legitimate bots, block malicious ones)
    if (detectBot(request)) {
      logSecurityEvent(request, 'BOT_DETECTED', path, false, { userAgent: request.headers.get('user-agent') });
      return createSecurityResponse('Access denied', 403);
    }

    // 3. Enhanced rate limiting
    if (!enhancedRateLimit(ip, 200, 60000)) { // 200 requests per minute
      logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', path, false, { ip });
      return createSecurityResponse('Too many requests', 429);
    }

    // 4. Admin IP whitelist check for admin routes
    if (path.startsWith('/api/admin') || path.includes('/admin/')) {
      if (!isAdminIPAllowed(ip)) {
        logSecurityEvent(request, 'ADMIN_IP_BLOCKED', path, false, { ip });
        return createSecurityResponse('Access denied', 403);
      }
    }

    // 5. Honeypot detection for form submissions
    if (method === 'POST' && request.headers.get('content-type')?.includes('multipart/form-data')) {
      try {
        const formData = await request.clone().formData();
        if (detectHoneypot(formData)) {
          logSecurityEvent(request, 'HONEYPOT_TRIGGERED', path, false, { ip });
          return createSecurityResponse('Invalid request', 400);
        }
      } catch {
        // Continue if form data parsing fails
      }
    }

    // 6. Generate request fingerprint for tracking
    const fingerprint = generateRequestFingerprint(request);
    
    // 7. Execute the actual handler
    const response = await handler(request);

    // 8. Apply security headers to response
    const securityHeaders = getEnhancedSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // 9. Log successful request
    const duration = Date.now() - startTime;
    logSecurityEvent(request, method, path, true, { 
      duration, 
      fingerprint,
      status: response.status 
    });

    return response;

  } catch (error) {
    // Log security error
    logSecurityEvent(request, 'SECURITY_ERROR', path, false, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    console.error('Security middleware error:', error);
    return createSecurityResponse('Internal server error', 500);
  }
}

function createSecurityResponse(message: string, status: number): NextResponse {
  const response = NextResponse.json({ error: message }, { status });
  
  // Apply security headers
  const securityHeaders = getEnhancedSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Wrapper for API route handlers
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return securityMiddleware(request, handler);
  };
}

// Database query sanitization wrapper
export function withDbSecurity<T extends (...args: any[]) => any>(
  dbFunction: T
): T {
  return ((...args: any[]) => {
    // Sanitize all arguments
    const sanitizedArgs = args.map(arg => sanitizeDbQuery(arg));
    return dbFunction(...sanitizedArgs);
  }) as T;
}

// Secure JSON parsing
export async function parseSecureJSON(request: NextRequest, maxSizeKB: number = 100): Promise<any> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSizeKB * 1024) {
    throw new Error('Request body too large');
  }

  const text = await request.text();
  
  // Check for suspicious patterns
  if (text.includes('<script') || text.includes('javascript:') || text.includes('eval(')) {
    throw new Error('Suspicious content detected');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON');
  }
}

// Secure form data parsing
export async function parseSecureFormData(request: NextRequest): Promise<FormData> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
    throw new Error('Request body too large');
  }

  const formData = await request.formData();
  
  // Check for honeypot fields
  if (detectHoneypot(formData)) {
    throw new Error('Invalid form submission');
  }

  return formData;
}

// CSRF protection for state-changing operations
export function requireCSRF(request: NextRequest, sessionId: string): boolean {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return true; // CSRF not required for read operations
  }

  const csrfToken = request.headers.get('x-csrf-token') || 
                   request.headers.get('csrf-token');

  if (!csrfToken) {
    return false;
  }

  // Validate CSRF token (implementation depends on your CSRF strategy)
  // This is a placeholder - implement actual CSRF validation
  return csrfToken.length > 10; // Basic check
}

// Content type validation
export function validateContentType(request: NextRequest, allowedTypes: string[]): boolean {
  const contentType = request.headers.get('content-type');
  if (!contentType) return false;

  return allowedTypes.some(type => contentType.includes(type));
}

// Request origin validation
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean);

  // Allow requests without origin (server-to-server, direct API calls)
  if (!origin && !referer) return true;

  if (origin) {
    return allowedOrigins.includes(origin);
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return allowedOrigins.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}

// Security audit logging
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
  
  // Keep only last 1000 logs
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
}

export function getAuditLogs(limit: number = 100): SecurityAuditLog[] {
  return auditLogs.slice(-limit);
}

// Security metrics
export function getSecurityMetrics() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const recentLogs = auditLogs.filter(log => 
    now - new Date(log.timestamp).getTime() < oneHour
  );

  return {
    totalRequests: recentLogs.length,
    blockedRequests: recentLogs.filter(log => log.blocked).length,
    uniqueIPs: new Set(recentLogs.map(log => log.ip)).size,
    averageResponseTime: recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length || 0,
    topPaths: getTopPaths(recentLogs),
    suspiciousIPs: getSuspiciousIPs(recentLogs)
  };
}

function getTopPaths(logs: SecurityAuditLog[]) {
  const pathCounts = logs.reduce((acc, log) => {
    acc[log.path] = (acc[log.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));
}

function getSuspiciousIPs(logs: SecurityAuditLog[]) {
  const ipStats = logs.reduce((acc, log) => {
    if (!acc[log.ip]) {
      acc[log.ip] = { total: 0, blocked: 0 };
    }
    acc[log.ip].total++;
    if (log.blocked) acc[log.ip].blocked++;
    return acc;
  }, {} as Record<string, { total: number; blocked: number }>);

  return Object.entries(ipStats)
    .filter(([, stats]) => stats.blocked > 0 || stats.total > 100)
    .sort(([, a], [, b]) => b.blocked - a.blocked)
    .slice(0, 10)
    .map(([ip, stats]) => ({ ip, ...stats }));
}