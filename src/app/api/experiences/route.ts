import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toRequiredString,
} from "@/lib/requestValidation";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const payload = await getSafeJsonBody(req);
    
    const experience = await db.experience.create({
      data: {
        authorName: toRequiredString(payload.authorName, "authorName", { maxLength: 120 }),
        content: toRequiredString(payload.content, "content", { maxLength: 5000 }),
        authorImage: payload.authorImage ? toAssetUrl(payload.authorImage, "authorImage") : undefined,
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });

    revalidatePath('/');
    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}
