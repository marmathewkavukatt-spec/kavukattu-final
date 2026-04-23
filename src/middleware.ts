import { NextRequest, NextResponse } from 'next/server';
import { productionSecurity } from './lib/security-production';

export async function middleware(request: NextRequest) {
  
  try {
    const hostname =
      request.nextUrl.hostname || request.headers.get("host")?.split(":")[0] || "";
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost");

    const isPrivateNetworkHost = (() => {
      if (!hostname) return false;
      if (hostname.endsWith(".local")) return true;

      const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      if (!ipv4) return false;
      const octets = ipv4.slice(1).map(Number);
      if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;

      const [a, b] = octets;
      if (a === 10) return true;
      if (a === 192 && b === 168) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      return false;
    })();

    // When running locally (including `next start`), don't let security middleware
    // block normal development/QA flows. Keep headers, skip blocking logic.
    const isRelaxed =
      process.env.NODE_ENV !== "production" ||
      isLocalhost ||
      isPrivateNetworkHost ||
      process.env.SECURITY_RELAXED === "true";

    if (isRelaxed) {
      const response = NextResponse.next();
      const securityHeaders = productionSecurity.getSecurityHeaders(request);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const path = request.nextUrl.pathname;
    
    // PERFORMANCE OPTIMIZATION: Only enforce strict security on VERY sensitive routes
    // This allows 100+ users to browse freely without hitting rate limits
    const isAuthSetup = path === "/api/auth/setup" && request.method === "POST";
    const isAuthLogin = path === "/api/auth/login" && request.method === "POST";
    const isSensitiveAuth = isAuthSetup || isAuthLogin;
    
    // For non-sensitive routes, just apply security headers (no rate limiting)
    if (!isSensitiveAuth) {
      const response = NextResponse.next();
      const securityHeaders = productionSecurity.getSecurityHeaders(request);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Only apply rate limiting to auth setup and login (most critical endpoints)
    const rateLimitResult = productionSecurity.advancedRateLimit(request);
    if (!rateLimitResult.allowed) {
      productionSecurity.logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', { 
        reason: rateLimitResult.reason 
      });
      const securityHeaders = productionSecurity.getSecurityHeaders(request);
      const retryAfter = (rateLimitResult.retryAfterSeconds ?? 60).toString();

      return NextResponse.json(
        { error: "Too Many Requests", reason: rateLimitResult.reason },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            "Retry-After": retryAfter,
          },
        },
      );
    }

    // Continue to the next middleware or route handler
    const response = NextResponse.next();
    
    // Apply security headers to all responses
    const securityHeaders = productionSecurity.getSecurityHeaders(request);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    // Log security middleware error only if debugging
    if (process.env.LOG_LEVEL === 'debug') {
      productionSecurity.logSecurityEvent(request, 'MIDDLEWARE_ERROR', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Security middleware error:', error);
    }
    
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: productionSecurity.getSecurityHeaders(request)
    });
  }
}

export const config = {
  matcher: [
    /*
     * ULTRA-MINIMAL SECURITY ENFORCEMENT
     * Only protect the most critical authentication endpoints
     * Everything else runs without rate limiting for maximum performance
     * 
     * Protected routes:
     * - /api/auth/login (login attempts)
     * - /api/auth/setup (initial admin setup)
     * 
     * All other routes (admin, API, public) have NO rate limiting
     * This allows 100+ concurrent users without any restrictions
     */
    '/api/auth/login',
    '/api/auth/setup',
  ],
};
