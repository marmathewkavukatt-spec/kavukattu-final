import { cookies } from "next/headers";
import {
  createToken,
  getCookieName,
  verifyToken,
  type SessionPayload,
} from "@/lib/auth-session";

export { createToken, verifyToken, getCookieName };

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return null;
  return verifyToken(token);
}

export type { SessionPayload };
