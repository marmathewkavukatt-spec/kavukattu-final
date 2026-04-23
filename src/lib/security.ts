import { NextResponse, type NextRequest } from "next/server";
import { getClientIP, rateLimit } from "@/lib/rateLimit";

interface RouteLimitPolicy {
  scope: string;
  max: number;
  windowMs: number;
  blockDurationMs: number;
}

// -----------------------------
// External origins
// -----------------------------
function getCloudinaryOrigin() {
  return "https://res.cloudinary.com";
}

function getCloudinaryApiOrigin() {
  return "https://api.cloudinary.com";
}

function getEmailJsOrigin() {
  return "https://api.emailjs.com";
}

// -----------------------------
// Content Security Policy
// -----------------------------
function buildContentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== "production";

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: blob: ${getCloudinaryOrigin()}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `media-src 'self' blob: ${getCloudinaryOrigin()}`,
    `connect-src 'self' ${getEmailJsOrigin()} ${getCloudinaryApiOrigin()}${
      isDev ? " ws: wss:" : ""
    }`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    !isDev ? "upgrade-insecure-requests" : "",
  ].filter(Boolean);

  return directives.join("; ");
}

// -----------------------------
// Method helpers
// -----------------------------
export function isStateChangingMethod(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

// -----------------------------
// ✅ FIXED ORIGIN CHECK (IMPORTANT)
// -----------------------------
export function hasAllowedRequestOrigin(request: NextRequest) {
  const originHeader = request.headers.get("origin");

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL, // REQUIRED in production
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  // ✅ Allow server-to-server / curl / SSR requests
  if (!originHeader) return true;

  try {
    const origin = new URL(originHeader).origin;
    return allowedOrigins.includes(origin);
  } catch {
    return false;
  }
}

// -----------------------------
// Rate limit config
// -----------------------------
function getRouteLimitPolicy(request: NextRequest): RouteLimitPolicy | null {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname === "/api/auth/login" && method === "POST") {
    return {
      scope: "auth-login",
      max: 10,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    };
  }

  if (pathname === "/api/auth/setup" && method === "POST") {
    return {
      scope: "auth-setup",
      max: 2,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 12 * 60 * 60 * 1000,
    };
  }

  if (pathname === "/api/upload" && method === "POST") {
    return {
      scope: "admin-upload",
      max: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    };
  }

  if (pathname === "/api/download" && method === "GET") {
    return {
      scope: "public-download",
      max: 30,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    };
  }

  if (pathname === "/api/view" && method === "GET") {
    return {
      scope: "public-view",
      max: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    };
  }

  if (pathname.startsWith("/api/") && isStateChangingMethod(method)) {
    return {
      scope: "api-mutation",
      max: 120,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    };
  }

  return null;
}

// -----------------------------
// Rate limit enforcement
// -----------------------------
export function enforceRateLimit(request: NextRequest) {
  const policy = getRouteLimitPolicy(request);
  if (!policy) return null;

  const key = `${policy.scope}:${getClientIP(request)}:${request.nextUrl.pathname}`;
  const result = rateLimit(key, policy);

  if (result.allowed) return null;

  const retryAfterSeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));

  const response = NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );

  response.headers.set("Retry-After", retryAfterSeconds.toString());
  response.headers.set("X-RateLimit-Limit", policy.max.toString());
  response.headers.set("X-RateLimit-Remaining", "0");

  return response;
}

// -----------------------------
// Security headers
// -----------------------------
export function applySecurityHeaders(
  response: NextResponse,
  request: NextRequest
) {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=(), browsing-topics=()"
  );

  response.headers.set("Origin-Agent-Cluster", "?1");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Prevent caching sensitive routes
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    isStateChangingMethod(request.method)
  ) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}