import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const DEFAULT_DEV_SECRET = "development-only-jwt-secret-change-before-production";
const MIN_SECRET_LENGTH = 32;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const TOKEN_ISSUER = "mar-mathew-kavukattu";
const TOKEN_AUDIENCE = "mar-mathew-kavukattu-admin";

const rawSecret = process.env.JWT_SECRET ?? DEFAULT_DEV_SECRET;

if (process.env.NODE_ENV === "production" && rawSecret.length < MIN_SECRET_LENGTH) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

const SECRET = new TextEncoder().encode(rawSecret);

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-church_admin_token"
    : "church_admin_token";

export interface SessionPayload extends JWTPayload {
  id: string;
  email?: string;
}

export async function createToken(payload: { id: string; email?: string }) {
  return new SignJWT({ id: payload.id, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    const id = typeof payload.id === "string" ? payload.id : payload.sub;
    if (!id) return null;

    const email = typeof payload.email === "string" ? payload.email : undefined;

    return {
      ...payload,
      id,
      email,
    };
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    priority: "high" as const,
  };
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
}
