import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toAssetUrl,
  toNumber,
  toOptionalString,
} from "@/lib/requestValidation";

// OPTIMIZED: Added select for specific fields
export async function GET() {
  try {
    const items = await db.gallery.findMany({ 
      orderBy: { order: "asc" },
      select: {
        id: true,
        image: true,
        caption: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return NextResponse.json(withUnderscoreIds(items));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const payload = await getSafeJsonBody(req);
    const item = await db.gallery.create({
      data: {
        image: toAssetUrl(payload.image, "image"),
        caption: toOptionalString(payload.caption, "caption", { maxLength: 300 }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
      },
      select: {
        id: true,
        image: true,
        caption: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    revalidatePath('/gallery');
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
