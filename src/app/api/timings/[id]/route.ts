import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toNumber,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";
import { isPrismaNotFoundError, withUnderscoreId } from "@/lib/prisma-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    const payload = await getSafeJsonBody(req);
    const item = await db.timing.update({
      where: { id: ensureRecordId(id) },
      data: {
        title: toRequiredString(payload.title, "title", { maxLength: 120 }),
        description: toOptionalString(payload.description, "description", {
          maxLength: 1000,
        }),
        schedule: toRequiredString(payload.schedule, "schedule", { maxLength: 500 }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
      },
    });
    revalidatePath("/visit");
    revalidatePath("/timings");
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    await db.timing.delete({ where: { id: ensureRecordId(id) } });
    revalidatePath("/visit");
    revalidatePath("/timings");
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
