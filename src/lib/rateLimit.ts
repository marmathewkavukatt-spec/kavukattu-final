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
}

const requestStore = globalThis.__kavukattuRequestRateLimitStore ?? new Map<string, SlidingWindowEntry>();
const loginAttemptStore = globalThis.__kavukattuLoginAttemptStore ?? new Map<string, LoginAttempt>();

globalThis.__kavukattuRequestRateLimitStore = requestStore;
globalThis.__kavukattuLoginAttemptStore = loginAttemptStore;

function pruneExpiredEntries<T>(
  store: Map<string, T>,
  shouldDelete: (entry: T, now: number) => boolean,
) {
  const now = Date.now();

  store.forEach((entry, key) => {
    if (shouldDelete(entry, now)) {
      store.delete(key);
    }
  });
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  pruneExpiredEntries(requestStore, (entry, now) => {
    const requestEntry = entry as SlidingWindowEntry;
    return requestEntry.resetAt <= now && (!requestEntry.blockedUntil || requestEntry.blockedUntil <= now);
  });

  const now = Date.now();
  const blockDurationMs = options.blockDurationMs ?? options.windowMs;
  const existing = requestStore.get(key);

  if (existing?.blockedUntil && existing.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.blockedUntil - now,
    };
  }

  const windowExpired = !existing || existing.resetAt <= now;
  const entry: SlidingWindowEntry = windowExpired
    ? { count: 0, resetAt: now + options.windowMs }
    : existing;

  entry.count += 1;

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
  pruneExpiredEntries(loginAttemptStore, (entry, now) => {
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
  const headerCandidates = [
    "cf-connecting-ip",
    "x-real-ip",
    "x-forwarded-for",
    "x-client-ip",
  ] as const;

  const rawCandidates: string[] = [];

  for (const header of headerCandidates) {
    const value = req.headers.get(header);
    if (!value) continue;
    rawCandidates.push(...value.split(",").map((part) => part.trim()).filter(Boolean));
  }

  const normalizedCandidates = rawCandidates
    .map((value) => normalizeIpCandidate(value))
    .filter(Boolean) as string[];

  // Prefer a public client IP if we can find one (helps when proxies prepend private IPs).
  for (const candidate of normalizedCandidates) {
    if (isPublicIp(candidate)) return candidate;
  }

  // Otherwise fall back to the first normalized value.
  if (normalizedCandidates[0]) return normalizedCandidates[0];

  const userAgent = req.headers.get("user-agent")?.trim() ?? "unknown";
  const acceptLanguage = req.headers.get("accept-language")?.trim() ?? "";
  const secChUa = req.headers.get("sec-ch-ua")?.trim() ?? "";
  const fingerprint = [userAgent, acceptLanguage, secChUa].filter(Boolean).join("|");
  return `unknown:${fingerprint.slice(0, 200)}`;
}

function normalizeIpCandidate(value: string): string | null {
  let candidate = value.trim();
  if (!candidate) return null;

  // Strip wrapping quotes
  candidate = candidate.replace(/^"+|"+$/g, "");

  // Strip zone index (e.g. fe80::1%lo0)
  const percent = candidate.indexOf("%");
  if (percent !== -1) {
    candidate = candidate.slice(0, percent);
  }

  // [IPv6]:port
  const bracketMatch = candidate.match(/^\[([^\]]+)\]:(\d{1,5})$/);
  if (bracketMatch) {
    candidate = bracketMatch[1];
  }

  // IPv4:port
  const ipv4PortMatch = candidate.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d{1,5}$/);
  if (ipv4PortMatch) {
    candidate = ipv4PortMatch[1];
  }

  // IPv4-mapped IPv6 (::ffff:1.2.3.4)
  const mappedIpv4Match = candidate.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mappedIpv4Match) {
    candidate = mappedIpv4Match[1];
  }

  if (isValidIPv4(candidate)) return candidate;
  if (isValidIPv6(candidate)) return candidate;

  return null;
}

function isValidIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const number = Number(part);
    return number >= 0 && number <= 255;
  });
}

function isValidIPv6(ip: string): boolean {
  // Basic guard: accept common IPv6 forms (not exhaustive).
  if (!ip.includes(":")) return false;
  if (ip.length < 2 || ip.length > 128) return false;
  return /^[0-9a-fA-F:]+$/.test(ip);
}

function isPublicIp(ip: string): boolean {
  if (isValidIPv4(ip)) {
    const [a, b] = ip.split(".").map((part) => Number(part));

    // Loopback, link-local, RFC1918 private ranges
    if (a === 127) return false;
    if (a === 10) return false;
    if (a === 192 && b === 168) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 169 && b === 254) return false;

    return true;
  }

  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return false;
  if (normalized.startsWith("fe80:")) return false; // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return false; // unique local

  return true;
}
