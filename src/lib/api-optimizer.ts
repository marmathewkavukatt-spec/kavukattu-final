/**
 * API Route Optimizer
 * Provides a backward-compatible API wrapper without request blocking.
 */

import { NextRequest, NextResponse } from 'next/server';

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
 * Keep the existing call shape, but do not rate-limit or cache responses.
 */
export function optimizeRoute(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: OptimizedRouteOptions = {}
) {
  void options;

  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return handler(req);

    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Database query wrapper retained for existing callers. It no longer caches.
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  void cacheKey;
  void ttl;
  return queryFn();
}

/**
 * Backward-compatible no-op now that API caching is disabled.
 */
export function invalidateApiCache(pattern: string) {
  void pattern;
}
