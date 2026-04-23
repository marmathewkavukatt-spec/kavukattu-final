import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toRequiredString,
} from "@/lib/requestValidation";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const experience = await db.experience.findUnique({
      where: { id: ensureRecordId(params.id) },
    });

    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: experience.id,
      authorName: experience.authorName,
      content: experience.content,
      authorImage: experience.authorImage,
      order: experience.order,
      active: experience.active,
      createdAt: experience.createdAt,
      updatedAt: experience.updatedAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const payload = await getSafeJsonBody(req);

    const experience = await db.experience.update({
      where: { id: ensureRecordId(params.id) },
      data: {
        authorName: toRequiredString(payload.authorName, "authorName", { maxLength: 120 }),
        content: toRequiredString(payload.content, "content", { maxLength: 5000 }),
        authorImage: payload.authorImage ? toAssetUrl(payload.authorImage, "authorImage") : undefined,
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });

    revalidatePath('/');
    return NextResponse.json(experience);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    await db.experience.delete({
      where: { id: ensureRecordId(params.id) },
    });

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
