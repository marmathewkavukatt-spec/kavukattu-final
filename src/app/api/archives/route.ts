import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  getSafeJsonBody,
  toAssetUrl,
  toOptionalString,
  toRequiredString,
} from "@/lib/requestValidation";

function toArchiveCategory(value: unknown) {
  const category = toRequiredString(value, "category", { minLength: 1, maxLength: 100 });
  return category;
}

function toOptionalBytes(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 2_000_000_000) {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  return Math.trunc(parsed);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const categoryParam = req.nextUrl.searchParams.get("category");
    const category = categoryParam ? toArchiveCategory(categoryParam) : null;

    const items = await db.archiveDocument.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(withUnderscoreIds(items));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const payload = await getSafeJsonBody(req);

    const item = await db.archiveDocument.create({
      data: {
        category: toArchiveCategory(payload.category),
        title: toOptionalString(payload.title, "title", { maxLength: 180, allowEmpty: false }),
        subtitle: toOptionalString(payload.subtitle, "subtitle", { maxLength: 300, allowEmpty: false }),
        description: toOptionalString(payload.description, "description", { maxLength: 5000, allowEmpty: false }),
        fileUrl: toAssetUrl(payload.fileUrl, "fileUrl"),
        fileName: toOptionalString(payload.fileName, "fileName", { maxLength: 255, allowEmpty: false }),
        fileType: toOptionalString(payload.fileType, "fileType", { maxLength: 120, allowEmpty: false }),
        fileSize: toOptionalBytes(payload.fileSize, "fileSize"),
      },
    });

    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

