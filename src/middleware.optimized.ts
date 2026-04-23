import { NextRequest, NextResponse } from 'next/server';
import { productionSecurity } from './lib/security-production';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  
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

    // Relaxed mode for development and localhost
    const isRelaxed =
      process.env.NODE_ENV !== "production" ||
      isLocalhost ||
      isPrivateNetworkHost ||
      process.env.SECURITY_RELAXED === "true";

    // Apply security headers but skip enforcement in relaxed mode
    if (isRelaxed) {
      const response = NextResponse.next();
      const securityHeaders = productionSecurity.getSecurityHeaders(request);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const path = request.nextUrl.pathname;
    
    // Only enforce strict security on sensitive routes
    const isSensitiveRoute =
      path.startsWith("/api/auth") ||
      path.startsWith("/api/admin") ||
      path.startsWith("/admin");

    // For non-sensitive API routes, apply minimal security
    if (path.startsWith("/api/") && !isSensitiveRoute) {
      const response = NextResponse.next();
      const securityHeaders = productionSecurity.getSecurityHeaders(request);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      // Basic rate limiting only
      const rateLimitResult = productionSecurity.advancedRateLimit(request);
      if (!rateLimitResult.allowed) {
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
      
      return response;
    }

    // Full security checks only for sensitive routes
    if (isSensitiveRoute) {
      // 1. Rate limiting (single check)
      const rateLimitResult = productionSecurity.advancedRateLimit(request);
      if (!rateLimitResult.allowed) {
        productionSecurity.logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', { 
          reason: rateLimitResult.reason 
        });
        const securityHeaders = productionSecurity.getSecurityHeaders(request);
        const retryAfter = (rateLimitResult.retryAfterSeconds ?? 60).toString();

        if (path.startsWith("/api/")) {
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

        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            ...securityHeaders,
            "Retry-After": retryAfter,
          },
        });
      }

      // 2. Bot detection (only for sensitive routes)
      if (productionSecurity.detectAdvancedBot(request)) {
        productionSecurity.logSecurityEvent(request, 'BOT_BLOCKED', { 
          userAgent: request.headers.get('user-agent') 
        });
        return new NextResponse('Access Denied', { 
          status: 403,
          headers: productionSecurity.getSecurityHeaders(request)
        });
      }

      // 3. CSRF protection for state-changing requests
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        
        const allowedOrigins = [
          process.env.NEXT_PUBLIC_APP_URL,
          'http://localhost:3000',
          'https://localhost:3000'
        ].filter(Boolean);
        
        let isValidOrigin = false;
        
        if (origin && allowedOrigins.includes(origin)) {
          isValidOrigin = true;
        } else if (referer) {
          try {
            const refererOrigin = new URL(referer).origin;
            isValidOrigin = allowedOrigins.includes(refererOrigin);
          } catch {
            // Invalid referer URL
          }
        }
        
        if (!isValidOrigin && (origin || referer)) {
          productionSecurity.logSecurityEvent(request, 'CSRF_INVALID_ORIGIN', { origin, referer });
          return new NextResponse('Forbidden', { 
            status: 403,
            headers: productionSecurity.getSecurityHeaders(request)
          });
        }
      }

      // 4. Suspicious pattern detection (only for sensitive routes)
      const url = request.nextUrl;
      const fullUrl = url.pathname + url.search;
      
      if (productionSecurity.detectSuspiciousPatterns(fullUrl)) {
        productionSecurity.logSecurityEvent(request, 'SUSPICIOUS_URL', { url: fullUrl });
        return new NextResponse('Forbidden', { 
          status: 403,
          headers: productionSecurity.getSecurityHeaders(request)
        });
      }
    }

    // Continue to the next middleware or route handler
    const response = NextResponse.next();
    
    // Apply security headers to all responses
    const securityHeaders = productionSecurity.getSecurityHeaders(request);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Only log security events for sensitive routes (not every request)
    if (isSensitiveRoute) {
      const duration = Date.now() - startTime;
      if (duration > 100) { // Only log slow requests
        productionSecurity.logSecurityEvent(request, 'SLOW_REQUEST', { duration });
      }
    }

    return response;

  } catch (error) {
    // Log security middleware error
    productionSecurity.logSecurityEvent(request, 'MIDDLEWARE_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    console.error('Security middleware error:', error);
    
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: productionSecurity.getSecurityHeaders(request)
    });
  }
}

export const config = {
  matcher: [
    // Only run middleware on API routes and admin pages
    '/api/:path*',
    '/admin/:path*',
  ],
};
