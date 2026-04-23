import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { getSession } from "@/lib/auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toRequiredString,
} from "@/lib/requestValidation";

// GET endpoint - returns all categories for admin, active only for public
export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    const where = session ? undefined : { active: true };
    const categories = await db.galleryCategory.findMany({
      where,
      orderBy: { order: "asc" },
    });
    return NextResponse.json(withUnderscoreIds(categories));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Admin endpoint - create new category
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    await connectDB();
    const payload = await getSafeJsonBody(req);
    const category = await db.galleryCategory.create({
      data: {
        title: toRequiredString(payload.title, "title", { maxLength: 200 }),
        coverImage: toAssetUrl(payload.coverImage, "coverImage"),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    revalidatePath('/gallery');
    revalidatePath('/');
    return NextResponse.json(withUnderscoreId(category));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
