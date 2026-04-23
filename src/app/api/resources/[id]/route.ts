import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toAssetUrl,
  toNumber,
  toOptionalString,
  toOptionalUrl,
  toRequiredString,
} from "@/lib/requestValidation";
import { isPrismaNotFoundError, withUnderscoreId } from "@/lib/prisma-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    const item = await db.resource.findUnique({ where: { id: ensureRecordId(id) } });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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
    const fileUrl = payload.fileUrl ? toAssetUrl(payload.fileUrl, "fileUrl") : undefined;
    const linkUrl = toOptionalUrl(payload.linkUrl, "linkUrl", { allowLocalPath: true });

    if (!fileUrl && !linkUrl) {
      return NextResponse.json(
        { error: "Either fileUrl or linkUrl is required" },
        { status: 400 },
      );
    }

    const item = await db.resource.update({
      where: { id: ensureRecordId(id) },
      data: {
        title: toRequiredString(payload.title, "title", { maxLength: 180 }),
        description: toOptionalString(payload.description, "description", {
          maxLength: 5000,
          allowEmpty: true,
        }) ?? "",
        fileUrl,
        linkUrl,
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
      },
    });
    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);
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
    await db.resource.delete({ where: { id: ensureRecordId(id) } });
    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);
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
