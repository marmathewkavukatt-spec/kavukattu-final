import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createToken, getCookieName } from "@/lib/auth";
import { getCookieOptions } from "@/lib/auth-session";
import {
  RequestValidationError,
  getSafeJsonBody,
  toEmail,
  toPassword,
} from "@/lib/requestValidation";
import { checkRateLimit, recordLoginAttempt, getClientIP } from "@/lib/rateLimit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await getSafeJsonBody(req);
    const email = toEmail(body.email);
    const password = toPassword(body.password, "password", {
      minLength: 1,
      required: true,
    });
    if (!password) {
      throw new RequestValidationError("Password is required.");
    }

    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const minutesLocked = rateLimit.lockedUntil
        ? Math.ceil((rateLimit.lockedUntil - Date.now()) / 60000)
        : 0;

      const response = NextResponse.json({
        error: `Too many failed attempts. Try again in ${minutesLocked} minute${minutesLocked !== 1 ? 's' : ''}.`,
        lockedUntil: rateLimit.lockedUntil,
      }, { status: 429 });

      if (rateLimit.lockedUntil) {
        response.headers.set(
          "Retry-After",
          Math.max(1, Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000)).toString(),
        );
      }

      return response;
    }

    // Optimized: Removed redundant connectDB() call and timeout wrapper
    // Prisma handles connections automatically with built-in pooling
    const admin = await db.admin.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, // Include email to avoid extra query in /api/auth/me
        passwordHash: true 
      },
    });

    if (!admin?.passwordHash) {
      recordLoginAttempt(clientIP, false);
      const updatedLimit = checkRateLimit(clientIP);

      return NextResponse.json({
        error: "Invalid email or password",
        remainingAttempts: updatedLimit.remainingAttempts,
      }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isValid) {
      recordLoginAttempt(clientIP, false);
      const updatedLimit = checkRateLimit(clientIP);

      return NextResponse.json({
        error: "Invalid email or password",
        remainingAttempts: updatedLimit.remainingAttempts,
      }, { status: 401 });
    }

    recordLoginAttempt(clientIP, true);
    
    // Include email in token to avoid extra DB query
    const token = await createToken({ id: admin.id, email: admin.email });

    const response = NextResponse.json({ success: true });
    response.cookies.set(getCookieName(), token, getCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Login error:', error);

    return NextResponse.json({
      error: "An error occurred. Please try again."
    }, { status: 500 });
  }
}
