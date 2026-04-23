import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toBoolean,
  toNumber,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";
import { isPrismaNotFoundError } from "@/lib/prisma-helpers";

// Admin endpoint - update timeline event
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    const payload = await getSafeJsonBody(req);
    
    const event = await db.timelineEvent.update({
      where: { id: ensureRecordId(id) },
      data: {
        year: toNumber(payload.year, "year", { min: 1000, max: 9999 }),
        title: toRequiredString(payload.title, "title", { maxLength: 180 }),
        description: toOptionalString(payload.description, "description", { maxLength: 500 }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    revalidatePath('/');
    return NextResponse.json(event);
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

// Admin endpoint - delete timeline event
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    await db.timelineEvent.delete({ where: { id: ensureRecordId(id) } });
    revalidatePath('/');
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
