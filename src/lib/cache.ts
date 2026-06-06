/**
 * Backward-compatible no-op cache helpers.
 *
 * Runtime caching is disabled to avoid stale page/API data after deploys.
 */

class NoopCache {
  get<T>(key: string): T | null {
    void key;
    return null;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    void key;
    void data;
    void ttlSeconds;
  }

  delete(key: string): void {
    void key;
  }

  clear(): void {}

  invalidatePattern(pattern: string): void {
    void pattern;
  }

  getStats() {
    return {
      size: 0,
      keys: [] as string[],
    };
  }

  destroy(): void {}
}

export const cache = new NoopCache();

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  void key;
  void ttlSeconds;
  return fn();
}

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
  favoursRecieved: () => 'favours-recieved:active',
};

export const invalidateCache = {
  sliders: () => {},
  testimonies: () => {},
  timings: () => {},
  about: () => {},
  visitInfo: () => {},
  announcements: () => {},
  gallery: () => {},
  resources: () => {},
  timeline: () => {},
  favoursRecieved: () => {},
  all: () => {},
};
