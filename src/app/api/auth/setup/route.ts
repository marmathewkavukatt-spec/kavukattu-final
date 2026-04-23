import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, connectDB } from "@/lib/db";
import {
  RequestValidationError,
  getSafeJsonBody,
  toEmail,
  toPassword,
} from "@/lib/requestValidation";
import { isPrismaUniqueConstraintError } from "@/lib/prisma-helpers";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await getSafeJsonBody(req);
    const email = toEmail(body.email);
    const password = toPassword(body.password, "password", {
      minLength: 12,
      required: true,
    });

    const setupEnabled =
      process.env.NODE_ENV !== "production" || process.env.ALLOW_ADMIN_SETUP === "true";

    const existingAdminCount = await db.admin.count();
    if (!setupEnabled || existingAdminCount > 0) {
      return NextResponse.json({ error: "Admin setup is disabled" }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(password ?? "", 12);
    await db.admin.create({ data: { email, passwordHash } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaUniqueConstraintError(error)) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    console.error(error);
    const message = error instanceof Error ? error.message : "Server error";
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      { error: "Server error", ...(isDev && { detail: message }) },
      { status: 500 }
    );
  }
}
