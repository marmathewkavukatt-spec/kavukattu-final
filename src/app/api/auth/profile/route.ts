import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, connectDB } from "@/lib/db";
import { requireAdmin, getAdminId } from "@/lib/api-auth";
import {
  RequestValidationError,
  getSafeJsonBody,
  toEmail,
  toPassword,
} from "@/lib/requestValidation";
import { isPrismaNotFoundError, isPrismaUniqueConstraintError } from "@/lib/prisma-helpers";

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const body = await getSafeJsonBody(req);
    const email = toEmail(body.email);
    const newPassword = toPassword(body.newPassword, "newPassword", { minLength: 12 });
    const currentPassword = toPassword(body.currentPassword, "currentPassword", {
      minLength: 1,
    });

    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await db.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 },
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }
    }

    const nextPasswordHash = newPassword ? await bcrypt.hash(newPassword, 12) : undefined;

    const updated = await db.admin.update({
      where: { id: admin.id },
      data: {
        email,
        ...(nextPasswordHash ? { passwordHash: nextPasswordHash } : {}),
      },
      select: { email: true },
    });

    return NextResponse.json({ success: true, email: updated.email });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (isPrismaUniqueConstraintError(error)) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
