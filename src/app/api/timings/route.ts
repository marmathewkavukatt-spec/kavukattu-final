import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toNumber,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";

export async function GET() {
  try {    const items = await db.timing.findMany({ orderBy: { order: "asc" } });
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
