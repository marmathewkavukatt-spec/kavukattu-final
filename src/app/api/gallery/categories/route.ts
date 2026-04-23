import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
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
import { cachedQuery, invalidateApiCache } from "@/lib/api-optimizer";

// GET endpoint - returns all categories for admin, active only for public
export async function GET() {
  try {
    const session = await getSession();
    const cacheKey = session ? 'gallery-categories:all' : 'gallery-categories:active';
    
    const categories = await cachedQuery(
      cacheKey,
      async () => {
        const where = session ? undefined : { active: true };
        return await db.galleryCategory.findMany({
          where,
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            coverImage: true,
            order: true,
            active: true,
          }
        });
      },
      300 // Cache for 5 minutes
    );
    
    return NextResponse.json(withUnderscoreIds(categories), {
      headers: {
        'Cache-Control': session 
          ? 'private, max-age=300' 
          : 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
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
    const payload = await getSafeJsonBody(req);
    const category = await db.galleryCategory.create({
      data: {
        title: toRequiredString(payload.title, "title", { maxLength: 200 }),
        coverImage: toAssetUrl(payload.coverImage, "coverImage"),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    
    // Invalidate cache
    invalidateApiCache('/gallery');
    
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
