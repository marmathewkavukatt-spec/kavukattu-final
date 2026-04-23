interface SlidingWindowEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  blockDurationMs?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __kavukattuRequestRateLimitStore: Map<string, SlidingWindowEntry> | undefined;
  // eslint-disable-next-line no-var
  var __kavukattuLoginAttemptStore: Map<string, LoginAttempt> | undefined;
  // eslint-disable-next-line no-var
  var __kavukattuCleanupInterval: NodeJS.Timeout | undefined;
}

const requestStore = globalThis.__kavukattuRequestRateLimitStore ?? new Map<string, SlidingWindowEntry>();
const loginAttemptStore = globalThis.__kavukattuLoginAttemptStore ?? new Map<string, LoginAttempt>();

globalThis.__kavukattuRequestRateLimitStore = requestStore;
globalThis.__kavukattuLoginAttemptStore = loginAttemptStore;

// Automatic cleanup every 5 minutes to prevent memory leaks
if (!globalThis.__kavukattuCleanupInterval) {
  globalThis.__kavukattuCleanupInterval = setInterval(() => {
    cleanupExpiredEntries();
  }, 5 * 60 * 1000); // 5 minutes

  // unref() so this timer doesn't prevent the Node.js process from exiting cleanly
  if (globalThis.__kavukattuCleanupInterval && typeof globalThis.__kavukattuCleanupInterval.unref === 'function') {
    globalThis.__kavukattuCleanupInterval.unref();
  }
}

function cleanupExpiredEntries() {
  const now = Date.now();
  let requestCleaned = 0;
  let loginCleaned = 0;

  // Cleanup request rate limit store
  requestStore.forEach((entry, key) => {
    if (entry.resetAt <= now && (!entry.blockedUntil || entry.blockedUntil <= now)) {
      requestStore.delete(key);
      requestCleaned++;
    }
  });

  // Cleanup login attempt store
  loginAttemptStore.forEach((entry, key) => {
    if (!entry.lockedUntil && now - entry.firstAttempt > 60 * 60 * 1000) {
      loginAttemptStore.delete(key);
      loginCleaned++;
    }
  });

  // Log cleanup stats only if significant cleanup happened
  if (requestCleaned > 10 || loginCleaned > 5) {
    console.log(`[Rate Limit] Cleaned up ${requestCleaned} request entries and ${loginCleaned} login entries`);
  }

  // Warn if stores are growing too large
  if (requestStore.size > 10000) {
    console.warn(`[Rate Limit] Request store size: ${requestStore.size} - consider reducing rate limit window`);
  }
  if (loginAttemptStore.size > 1000) {
    console.warn(`[Rate Limit] Login attempt store size: ${loginAttemptStore.size}`);
  }
}

// Lightweight pruning - only check every 100 requests
let requestCount = 0;
function maybePruneExpiredEntries<T>(
  store: Map<string, T>,
  shouldDelete: (entry: T, now: number) => boolean,
) {
  requestCount++;
  
  // Only prune every 100 requests to reduce overhead
  if (requestCount % 100 !== 0) {
    return;
  }

  const now = Date.now();
  let pruned = 0;

  store.forEach((entry, key) => {
    if (shouldDelete(entry, now)) {
      store.delete(key);
      pruned++;
    }
  });
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  // Lightweight pruning
  maybePruneExpiredEntries(requestStore, (entry, now) => {
    const requestEntry = entry as SlidingWindowEntry;
    return requestEntry.resetAt <= now && (!requestEntry.blockedUntil || requestEntry.blockedUntil <= now);
  });

  const now = Date.now();
  const blockDurationMs = options.blockDurationMs ?? options.windowMs;
  const existing = requestStore.get(key);

  // Check if blocked
  if (existing?.blockedUntil && existing.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.blockedUntil - now,
    };
  }

  // Check if window expired
  const windowExpired = !existing || existing.resetAt <= now;
  const entry: SlidingWindowEntry = windowExpired
    ? { count: 0, resetAt: now + options.windowMs }
    : existing;

  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > options.max) {
    entry.blockedUntil = now + blockDurationMs;
    requestStore.set(key, entry);

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: blockDurationMs,
    };
  }

  requestStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, options.max - entry.count),
    retryAfterMs: Math.max(0, entry.resetAt - now),
  };
}

export function checkRateLimit(ip: string) {
  // Lightweight pruning
  maybePruneExpiredEntries(loginAttemptStore, (entry, now) => {
    const attempt = entry as LoginAttempt;
    return !attempt.lockedUntil && now - attempt.firstAttempt > 60 * 60 * 1000;
  });

  const now = Date.now();
  const attempt = loginAttemptStore.get(ip);

  if (!attempt) {
    return { allowed: true, remainingAttempts: 5, lockedUntil: undefined };
  }

  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    };
  }

  if (now - attempt.firstAttempt > 15 * 60 * 1000) {
    loginAttemptStore.delete(ip);
    return { allowed: true, remainingAttempts: 5, lockedUntil: undefined };
  }

  return {
    allowed: attempt.count < 5,
    remainingAttempts: Math.max(0, 5 - attempt.count),
    lockedUntil: attempt.lockedUntil,
  };
}

export function recordLoginAttempt(ip: string, success: boolean) {
  const now = Date.now();
  const attempt = loginAttemptStore.get(ip);

  if (success) {
    loginAttemptStore.delete(ip);
    return;
  }

  if (!attempt || now - attempt.firstAttempt > 15 * 60 * 1000) {
    loginAttemptStore.set(ip, {
      count: 1,
      firstAttempt: now,
    });
    return;
  }

  attempt.count += 1;

  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 30 * 60 * 1000;
  }

  loginAttemptStore.set(ip, attempt);
}

export function getClientIP(req: Pick<Request, "headers">): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cloudflareIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const userAgent = req.headers.get("user-agent")?.trim() ?? "unknown";
  return `unknown:${userAgent.slice(0, 120)}`;
}

// Export cleanup function for manual cleanup if needed
export function manualCleanup() {
  cleanupExpiredEntries();
}

// Export stats for monitoring
export function getRateLimitStats() {
  return {
    requestStoreSize: requestStore.size,
    loginAttemptStoreSize: loginAttemptStore.size,
    timestamp: new Date().toISOString()
  };
}
