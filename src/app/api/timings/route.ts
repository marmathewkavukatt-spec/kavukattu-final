import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toNumber,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";
import { cachedQuery, invalidateApiCache } from "@/lib/api-optimizer";

export async function GET() {
  try {
    const items = await cachedQuery(
      'timings:all',
      async () => {
        return await db.timing.findMany({ 
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            schedule: true,
            order: true,
          }
        });
      },
      600 // Cache for 10 minutes
    );
    
    return NextResponse.json(withUnderscoreIds(items), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
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
    const item = await db.timing.create({
      data: {
        title: toRequiredString(payload.title, "title", { maxLength: 120 }),
        description: toOptionalString(payload.description, "description", {
          maxLength: 1000,
        }),
        schedule: toRequiredString(payload.schedule, "schedule", { maxLength: 500 }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
      },
    });
    
    // Invalidate cache
    invalidateApiCache('/timings');
    
    revalidatePath("/visit");
    revalidatePath("/timings");
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
