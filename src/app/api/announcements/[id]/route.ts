import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toBoolean,
  toDate,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";
import { isPrismaNotFoundError, withUnderscoreId } from "@/lib/prisma-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    const payload = await getSafeJsonBody(req);
    
    // Validate that at least coverImage is provided
    const coverImage = toOptionalString(payload.coverImage, "coverImage");
    if (!coverImage) {
      throw new RequestValidationError("coverImage is required", 400);
    }
    
    const item = await db.announcement.update({
      where: { id: ensureRecordId(id) },
      data: {
        title: toOptionalString(payload.title, "title", { maxLength: 180 }) || "Untitled",
        subtitle: toOptionalString(payload.subtitle, "subtitle", { maxLength: 300 }),
        description: toOptionalString(payload.description, "description", { maxLength: 5000 }),
        content: toOptionalString(payload.content, "content", { maxLength: 5000 }) || "",
        category: toRequiredString(payload.category, "category", { maxLength: 50 }),
        coverImage: coverImage,
        fileUrl: toOptionalString(payload.fileUrl, "fileUrl"),
        date: toDate(payload.date, "date"),
        active: toBoolean(payload.active, true),
      },
    });
    revalidatePath('/announcements');
    revalidatePath('/');
    revalidatePath(`/announcements/${id}`);
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
    await db.announcement.delete({ where: { id: ensureRecordId(id) } });
    revalidatePath('/announcements');
    revalidatePath('/');
    revalidatePath(`/announcements/${id}`);
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
