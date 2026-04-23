/**
 * Simple in-memory cache for frequently accessed data
 * For production, consider using Redis for multi-instance support
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // unref() so this timer doesn't prevent the Node.js process from exiting cleanly,
    // which avoids Hostinger's process manager seeing a "stuck" process and restarting it.
    if (this.cleanupInterval && typeof (this.cleanupInterval as NodeJS.Timeout).unref === 'function') {
      (this.cleanupInterval as NodeJS.Timeout).unref();
    }
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with TTL in seconds
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __kavukattuCacheInstance: SimpleCache | undefined;
}

// Singleton instance — persisted on globalThis to survive Next.js hot-module reloads
// and prevent multiple setInterval timers from being created on Hostinger worker restarts.
if (!globalThis.__kavukattuCacheInstance) {
  globalThis.__kavukattuCacheInstance = new SimpleCache();
}
export const cache: SimpleCache = globalThis.__kavukattuCacheInstance;

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  cache.set(key, result, ttlSeconds);
  return result;
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  sliders: () => 'sliders:active',
  testimonies: () => 'testimonies:active',
  timings: () => 'timings:all',
  about: () => 'about:latest',
  visitInfo: () => 'visit-info:latest',
  announcements: (page: number, limit: number, category?: string) => 
    `announcements:${page}:${limit}:${category || 'all'}`,
  galleryCategories: () => 'gallery:categories:active',
  galleryCategory: (id: string) => `gallery:category:${id}`,
  resources: () => 'resources:all',
  timeline: () => 'timeline:active',
  experiences: () => 'experiences:active',
};

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  sliders: () => cache.delete(cacheKeys.sliders()),
  testimonies: () => cache.delete(cacheKeys.testimonies()),
  timings: () => cache.delete(cacheKeys.timings()),
  about: () => cache.delete(cacheKeys.about()),
  visitInfo: () => cache.delete(cacheKeys.visitInfo()),
  announcements: () => cache.invalidatePattern('^announcements:'),
  gallery: () => cache.invalidatePattern('^gallery:'),
  resources: () => cache.delete(cacheKeys.resources()),
  timeline: () => cache.delete(cacheKeys.timeline()),
  experiences: () => cache.delete(cacheKeys.experiences()),
  all: () => cache.clear(),
};
