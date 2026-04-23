import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  getSafeJsonBody,
  toBoolean,
  toNumber,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";
import { withUnderscoreIds } from "@/lib/prisma-helpers";

// Public endpoint - get active timeline events
export async function GET() {
  try {    const events = await db.timelineEvent.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(withUnderscoreIds(events));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Admin endpoint - create timeline event
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const payload = await getSafeJsonBody(req);
    const event = await db.timelineEvent.create({
      data: {
        year: toNumber(payload.year, "year", { min: 1000, max: 9999 }),
        title: toRequiredString(payload.title, "title", { maxLength: 180 }),
        description: toOptionalString(payload.description, "description", { maxLength: 500 }),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    revalidatePath('/');
    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
