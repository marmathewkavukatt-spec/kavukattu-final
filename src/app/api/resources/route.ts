import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toAssetUrl,
  toNumber,
  toOptionalString,
  toOptionalUrl,
  toRequiredString,
} from "@/lib/requestValidation";

export async function GET() {
  try {    const items = await db.resource.findMany({ orderBy: { order: "asc" } });
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
    const fileUrl = payload.fileUrl ? toAssetUrl(payload.fileUrl, "fileUrl") : undefined;
    const linkUrl = toOptionalUrl(payload.linkUrl, "linkUrl", { allowLocalPath: true });

    if (!fileUrl && !linkUrl) {
      return NextResponse.json(
        { error: "Either fileUrl or linkUrl is required" },
        { status: 400 },
      );
    }

    const item = await db.resource.create({
      data: {
        title: toRequiredString(payload.title, "title", { maxLength: 180 }),
        description: toOptionalString(payload.description, "description", {
          maxLength: 5000,
          allowEmpty: true,
        }) ?? "",
        fileUrl,
        linkUrl,
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
      },
    });
    revalidatePath("/resources");
    revalidatePath(`/resources/${item.id}`);
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
