import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toRequiredString,
} from "@/lib/requestValidation";

export async function GET() {
  try {    const items = await db.testimony.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
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
  try {    const payload = await getSafeJsonBody(req);
    const item = await db.testimony.create({
      data: {
        authorName: toRequiredString(payload.authorName, "authorName", { maxLength: 120 }),
        content: toRequiredString(payload.content, "content", { maxLength: 5000 }),
        authorImage: payload.authorImage ? toAssetUrl(payload.authorImage, "authorImage") : undefined,
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    revalidatePath("/experiences");
    revalidatePath("/testimony");
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
