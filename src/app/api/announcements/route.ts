import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toBoolean,
  toDate,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";
import { cachedQuery, invalidateApiCache } from "@/lib/api-optimizer";

// Paginated announcement listing
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50); // Max 50 items
    const category = searchParams.get("category");
    const skip = (page - 1) * limit;

    const cacheKey = `announcements:${page}:${limit}:${category || 'all'}`;

    const result = await cachedQuery(
      cacheKey,
      async () => {
        // Build where clause
        const where: any = { active: true };
        if (category) {
          where.category = category;
        }

        // Parallel queries for better performance
        const [items, total] = await Promise.all([
          db.announcement.findMany({
            where,
            orderBy: { date: "desc" },
            skip,
            take: limit,
            select: {
              id: true,
              title: true,
              subtitle: true,
              description: true,
              category: true,
              coverImage: true,
              date: true,
              active: true,
              createdAt: true,
              updatedAt: true,
            }
          }),
          db.announcement.count({ where })
        ]);

        return {
          announcements: withUnderscoreIds(items),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          }
        };
      },
      0
    );

    return NextResponse.json(result, {
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
  try {
    const payload = await getSafeJsonBody(req);
    
    // Validate that at least coverImage is provided
    const coverImage = toOptionalString(payload.coverImage, "coverImage");
    if (!coverImage) {
      throw new RequestValidationError("coverImage is required", 400);
    }
    
    const item = await db.announcement.create({
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
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        content: true,
        category: true,
        coverImage: true,
        fileUrl: true,
        date: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    // Invalidate cache
    invalidateApiCache('/announcements');
    
    revalidatePath('/announcements');
    revalidatePath('/');
    revalidatePath(`/announcements/${item.id}`);
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
