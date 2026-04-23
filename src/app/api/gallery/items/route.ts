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
  toRequiredString,
} from "@/lib/requestValidation";
import { withUnderscoreId } from "@/lib/prisma-helpers";

// Admin endpoint - create new gallery item
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const payload = await getSafeJsonBody(req);
    const categoryId = ensureRecordId(toRequiredString(payload.categoryId, "categoryId"), "categoryId");
    const item = await db.galleryItem.create({
      data: {
        categoryId,
        image: toAssetUrl(payload.image, "image"),
        title: toOptionalString(payload.title, "title", { maxLength: 200 }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
      },
    });
    revalidatePath(`/gallery/${categoryId}`);
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
