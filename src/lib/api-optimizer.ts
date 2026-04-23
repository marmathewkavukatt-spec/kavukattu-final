/**
 * API Route Optimizer
 * Provides compression, caching, and performance monitoring for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache, withCache } from './cache';

interface OptimizedRouteOptions {
  cache?: {
    enabled: boolean;
    ttl?: number;           // seconds
    varyByQuery?: boolean;
  };
  rateLimit?: {
    enabled: boolean;
    maxRequests?: number;
    windowMs?: number;
  };
}

/**
 * Simple in-memory rate limiter for API routes
 */
class SimpleRateLimiter {
  private requests = new Map<string, number[]>();

  check(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || [];
    
    // Remove old timestamps outside the window
    timestamps = timestamps.filter(ts => ts > windowStart);
    
    // Check if limit exceeded
    if (timestamps.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    timestamps.push(now);
    this.requests.set(identifier, timestamps);
    
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(ts => ts > now - 60000);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

const rateLimiter = new SimpleRateLimiter();

// Cleanup rate limiter every minute
setInterval(() => rateLimiter.cleanup(), 60000);

/**
 * Get client identifier for rate limiting
 */
function getClientId(req: NextRequest): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown';
}

/**
 * Optimize API route with caching and rate limiting
 */
export function optimizeRoute<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  options: OptimizedRouteOptions = {}
) {
  const {
    cache: cacheOpts = { enabled: true, ttl: 60, varyByQuery: true },
    rateLimit: rateLimitOpts = { enabled: false, maxRequests: 100, windowMs: 60000 },
  } = options;

  return async (req: NextRequest): Promise<NextResponse<T>> => {
    try {
      // Rate limiting (if enabled)
      if (rateLimitOpts.enabled) {
        const clientId = getClientId(req);
        const allowed = rateLimiter.check(
          clientId,
          rateLimitOpts.maxRequests || 100,
          rateLimitOpts.windowMs || 60000
        );

        if (!allowed) {
          return NextResponse.json(
            { error: 'Too many requests' } as any,
            { 
              status: 429,
              headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': String(rateLimitOpts.maxRequests),
                'X-RateLimit-Remaining': '0',
              }
            }
          );
        }
      }

      // Response caching (only for GET requests)
      if (req.method === 'GET' && cacheOpts.enabled) {
        const url = new URL(req.url);
        let cacheKey = `api:${url.pathname}`;
        
        if (cacheOpts.varyByQuery && url.search) {
          cacheKey += url.search;
        }

        // Try cache first
        const cached = cache.get<any>(cacheKey);
        if (cached !== null) {
          return NextResponse.json(cached, {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': `public, max-age=${cacheOpts.ttl || 60}`,
            }
          });
        }

        // Execute handler
        const response = await handler(req);
        
        // Cache successful responses
        if (response.status === 200) {
          const data = await response.json();
          cache.set(cacheKey, data, cacheOpts.ttl || 60);
          
          return NextResponse.json(data, {
            status: 200,
            headers: {
              'X-Cache': 'MISS',
              'Cache-Control': `public, max-age=${cacheOpts.ttl || 60}`,
            }
          });
        }

        return response;
      }

      // No caching for non-GET requests
      return handler(req);

    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' } as any,
        { status: 500 }
      );
    }
  };
}

/**
 * Cached database query wrapper
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  return withCache(cacheKey, queryFn, ttl);
}

/**
 * Invalidate API cache by pattern
 */
export function invalidateApiCache(pattern: string) {
  cache.invalidatePattern(`^api:${pattern}`);
}
