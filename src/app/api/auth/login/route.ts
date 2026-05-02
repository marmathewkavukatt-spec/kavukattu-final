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
      return NextResponse.json({
        error: "Invalid email or password",
      }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isValid) {
      return NextResponse.json({
        error: "Invalid email or password",
      }, { status: 401 });
    }

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
