import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  getSafeJsonBody,
  toOptionalString,
} from "@/lib/requestValidation";
import { withUnderscoreId } from "@/lib/prisma-helpers";

// Public endpoint - get visit info
export async function GET() {
  try {    const visitInfo = await db.visitInfo.findFirst();
    return NextResponse.json(visitInfo ? withUnderscoreId(visitInfo) : null);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Admin endpoint - create or update visit info
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const payload = await getSafeJsonBody(req);
    
    // Check if visit info already exists
    const existing = await db.visitInfo.findFirst();
    
    const data = {
      mapEmbedUrl: toOptionalString(payload.mapEmbedUrl, "mapEmbedUrl", { maxLength: 5000 }),
      address: toOptionalString(payload.address, "address", { maxLength: 1000 }),
      directions: toOptionalString(payload.directions, "directions", { maxLength: 5000 }),
      nearbyLandmarks: toOptionalString(payload.nearbyLandmarks, "nearbyLandmarks", { maxLength: 5000 }),
      travelGuidance: toOptionalString(payload.travelGuidance, "travelGuidance", { maxLength: 5000 }),
    };
    
    let visitInfo;
    if (existing) {
      visitInfo = await db.visitInfo.update({
        where: { id: existing.id },
        data,
      });
    } else {
      visitInfo = await db.visitInfo.create({ data });
    }
    
    revalidatePath("/visit");
    revalidatePath("/timings");
    return NextResponse.json(withUnderscoreId(visitInfo));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
