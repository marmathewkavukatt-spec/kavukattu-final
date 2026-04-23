/**
 * HTTP Response Caching Middleware
 * Caches entire API responses to reduce database load
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from './cache';

interface CacheOptions {
  ttl?: number;           // Time to live in seconds (default: 60)
  varyByQuery?: boolean;  // Include query params in cache key (default: true)
  varyByAuth?: boolean;   // Include auth status in cache key (default: false)
}

/**
 * Wrap API route handlers with response caching
 */
export function withResponseCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  const {
    ttl = 60,
    varyByQuery = true,
    varyByAuth = false,
  } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req);
    }

    // Build cache key
    const url = new URL(req.url);
    let cacheKey = `response:${url.pathname}`;
    
    if (varyByQuery && url.search) {
      cacheKey += `:${url.search}`;
    }
    
    if (varyByAuth) {
      const authHeader = req.headers.get('authorization');
      cacheKey += `:${authHeader ? 'auth' : 'anon'}`;
    }

    // Try to get cached response
    const cached = cache.get<{
      status: number;
      headers: Record<string, string>;
      body: any;
    }>(cacheKey);

    if (cached) {
      return NextResponse.json(cached.body, {
        status: cached.status,
        headers: {
          ...cached.headers,
          'X-Cache': 'HIT',
        },
      });
    }

    // Execute handler
    const response = await handler(req);
    
    // Only cache successful responses
    if (response.status === 200) {
      const body = await response.json();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      cache.set(cacheKey, {
        status: response.status,
        headers,
        body,
      }, ttl);

      return NextResponse.json(body, {
        status: response.status,
        headers: {
          ...headers,
          'X-Cache': 'MISS',
        },
      });
    }

    return response;
  };
}

/**
 * Invalidate response cache by path pattern
 */
export function invalidateResponseCache(pathPattern: string) {
  cache.invalidatePattern(`^response:${pathPattern}`);
}
