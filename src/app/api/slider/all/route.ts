import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreIds } from "@/lib/prisma-helpers";
import { cachedQuery } from "@/lib/api-optimizer";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const items = await cachedQuery(
      'slider:all',
      async () => {
        return await db.slider.findMany({ 
          orderBy: { order: "asc" },
          select: {
            id: true,
            image: true,
            title: true,
            subtitle: true,
            order: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          }
        });
      },
      300 // Cache for 5 minutes
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
