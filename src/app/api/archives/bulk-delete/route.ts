import { unlink } from "fs/promises";
import { relative, resolve } from "path";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { deleteCloudinaryAssetByUrl } from "@/lib/cloudinary";
import { RequestValidationError, ensureRecordId, getSafeJsonBody } from "@/lib/requestValidation";

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

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendProgress = async (data: { deleted: number; total: number; current?: string; error?: string }) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    try {
      const payload = await getSafeJsonBody(req);

      if (!Array.isArray(payload.ids) || payload.ids.length === 0) {
        await sendProgress({ deleted: 0, total: 0, error: "No IDs provided" });
        await writer.close();
        return;
      }

      const ids = (payload.ids as unknown[]).map((id) => ensureRecordId(String(id), "id"));
      const total = ids.length;
      let deleted = 0;

      await sendProgress({ deleted, total });

      for (const id of ids) {
        try {
          const record = await db.archiveDocument.delete({ where: { id } });
          try {
            await deleteAssetByUrl(record.fileUrl);
          } catch (cleanupError) {
            console.error("Archive bulk delete file cleanup failed:", cleanupError);
          }
          deleted += 1;
          await sendProgress({ deleted, total, current: id });
        } catch (error) {
          console.error("Archive bulk delete failed:", error);
          await sendProgress({ deleted, total, current: id, error: "Failed to delete one or more items." });
        }
      }

      await writer.close();
    } catch (error) {
      if (error instanceof RequestValidationError) {
        await sendProgress({ deleted: 0, total: 0, error: error.message });
      } else {
        console.error(error);
        await sendProgress({ deleted: 0, total: 0, error: "Server error" });
      }
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

