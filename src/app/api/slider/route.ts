import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { revalidatePath } from "next/cache";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toOptionalString,
} from "@/lib/requestValidation";
import { cachedQuery, invalidateApiCache } from "@/lib/api-optimizer";

export async function GET() {
  try {
    const items = await cachedQuery(
      'slider:active',
      async () => {
        return await db.slider.findMany({
          where: { active: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            image: true,
            title: true,
            subtitle: true,
            order: true,
            active: true,
          }
        });
      },
      300 // Cache for 5 minutes
    );
    
    return NextResponse.json(withUnderscoreIds(items), {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const payload = await getSafeJsonBody(req);
    const item = await db.slider.create({
      data: {
        image: toAssetUrl(payload.image, "image"),
        title: toOptionalString(payload.title, "title", { maxLength: 180, allowEmpty: true }),
        subtitle: toOptionalString(payload.subtitle, "subtitle", { maxLength: 300, allowEmpty: true }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    
    // Invalidate cache
    invalidateApiCache('/slider');
    
    revalidatePath('/');
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
