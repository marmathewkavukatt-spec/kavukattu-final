import { NextRequest, NextResponse } from "next/server";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { revalidatePath } from "next/cache";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toOptionalString,
} from "@/lib/requestValidation";
import { isPrismaNotFoundError, withUnderscoreId } from "@/lib/prisma-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {    const { id } = await params;
    const item = await db.slider.findUnique({ where: { id: ensureRecordId(id) } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    const payload = await getSafeJsonBody(req);
    const item = await db.slider.update({
      where: { id: ensureRecordId(id) },
      data: {
        image: toAssetUrl(payload.image, "image"),
        title: toOptionalString(payload.title, "title", { maxLength: 180, allowEmpty: true }),
        subtitle: toOptionalString(payload.subtitle, "subtitle", { maxLength: 300, allowEmpty: true }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    revalidatePath('/');
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
    await db.slider.delete({ where: { id: ensureRecordId(id) } });
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
