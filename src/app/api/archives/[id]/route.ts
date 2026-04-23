import { unlink } from "fs/promises";
import { relative, resolve } from "path";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { deleteCloudinaryAssetByUrl } from "@/lib/cloudinary";
import { isPrismaNotFoundError, withUnderscoreId } from "@/lib/prisma-helpers";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toAssetUrl,
  toOptionalString,
} from "@/lib/requestValidation";

const ARCHIVE_CATEGORIES = ["PASTORAL_LETTERS", "CIRCULARS", "OTHERS"] as const;
type ArchiveCategory = (typeof ARCHIVE_CATEGORIES)[number];

function toArchiveCategory(value: unknown) {
  if (typeof value !== "string") {
    throw new RequestValidationError("category is required.");
  }

  const normalized = value.trim().toUpperCase();
  if (!(ARCHIVE_CATEGORIES as readonly string[]).includes(normalized)) {
    throw new RequestValidationError("Invalid category.");
  }

  return normalized as ArchiveCategory;
}

function toOptionalBytes(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 2_000_000_000) {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  return Math.trunc(parsed);
}

function getUploadFilePath(fileUrl: string) {
  if (!fileUrl.startsWith("/uploads/")) {
    return null;
  }

  const publicDir = resolve(process.cwd(), "public");
  const uploadDir = resolve(publicDir, "uploads");
  const absolutePath = resolve(publicDir, fileUrl.replace(/^\/+/, ""));
  const uploadRelativePath = relative(uploadDir, absolutePath);

  if (!uploadRelativePath || uploadRelativePath.startsWith("..")) {
    return null;
  }

  return absolutePath;
}

async function deleteAssetByUrl(fileUrl: string) {
  if (!fileUrl) return;

  if (fileUrl.startsWith("https://res.cloudinary.com/")) {
    await deleteCloudinaryAssetByUrl(fileUrl);
    return;
  }

  const filePath = getUploadFilePath(fileUrl);
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const { id } = await params;
    const item = await db.archiveDocument.findUnique({ where: { id: ensureRecordId(id) } });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(withUnderscoreId(item));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const { id } = await params;
    const payload = await getSafeJsonBody(req);

    const recordId = ensureRecordId(id);
    const existing = await db.archiveDocument.findUnique({ where: { id: recordId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextFileUrl = toAssetUrl(payload.fileUrl, "fileUrl");

    const updated = await db.archiveDocument.update({
      where: { id: recordId },
      data: {
        category: toArchiveCategory(payload.category),
        title: toOptionalString(payload.title, "title", { maxLength: 180, allowEmpty: false }),
        subtitle: toOptionalString(payload.subtitle, "subtitle", { maxLength: 300, allowEmpty: false }),
        description: toOptionalString(payload.description, "description", { maxLength: 5000, allowEmpty: false }),
        fileUrl: nextFileUrl,
        fileName: toOptionalString(payload.fileName, "fileName", { maxLength: 255, allowEmpty: false }),
        fileType: toOptionalString(payload.fileType, "fileType", { maxLength: 120, allowEmpty: false }),
        fileSize: toOptionalBytes(payload.fileSize, "fileSize"),
      },
    });

    if (existing.fileUrl && existing.fileUrl !== nextFileUrl) {
      try {
        await deleteAssetByUrl(existing.fileUrl);
      } catch (cleanupError) {
        console.error("Failed to delete previous archive file:", cleanupError);
      }
    }

    return NextResponse.json(withUnderscoreId(updated));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const { id } = await params;
    const recordId = ensureRecordId(id);
    const deleted = await db.archiveDocument.delete({ where: { id: recordId } });

    try {
      await deleteAssetByUrl(deleted.fileUrl);
    } catch (cleanupError) {
      console.error("Failed to delete archive file:", cleanupError);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

