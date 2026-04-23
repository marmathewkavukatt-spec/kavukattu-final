import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join, relative, resolve } from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  deleteCloudinaryAssetByUrl,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} from "@/lib/cloudinary";
import { sanitizeFilename } from "@/lib/requestValidation";
import {
  getMaxUploadBytes,
  getNormalizedExtension,
  isAllowedUpload,
  isImageUpload,
} from "@/lib/upload-policy";
import {
  compressImage,
  shouldCompressImage,
  getCompressedExtension,
} from "@/lib/image-compression";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toUrlSafeFileStem(value: string) {
  const normalized = value
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return normalized || "upload";
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

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const forceLocalStorage = req.nextUrl.searchParams.get("storage") === "local";
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    const safeName = sanitizeFilename(file.name, "upload");
    if (!isAllowedUpload({ contentType: file.type, filename: safeName })) {
      return NextResponse.json(
        { error: "Invalid file type. Upload an image, PDF, Word, Excel, PowerPoint, RTF, or text file." },
        { status: 400 },
      );
    }

    const maxSize = getMaxUploadBytes({ contentType: file.type, filename: safeName });
    if (file.size > maxSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large (${sizeMb}MB). Max ${maxMb}MB.` },
        { status: 400 },
      );
    }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    const extension = getNormalizedExtension(safeName);
    const baseName = toUrlSafeFileStem(safeName) || "upload";
    let contentType = file.type || "application/octet-stream";
    const isImage = isImageUpload({ contentType: file.type, filename: safeName });

    // Compress images to save space
    let finalExtension = extension;
    if (shouldCompressImage(file.type, safeName)) {
      try {
        const compressed = await compressImage(buffer, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 80,
          format: "webp", // Convert all images to WebP for better compression
        });
        buffer = compressed.buffer;
        finalExtension = getCompressedExtension(compressed.format);
        contentType = `image/${compressed.format}`;
        
        console.log(
          `Image compressed: ${file.name} (${(file.size / 1024).toFixed(2)}KB → ${(compressed.size / 1024).toFixed(2)}KB)`
        );
      } catch (error) {
        console.error("Image compression failed, using original:", error);
        // Continue with original buffer if compression fails
      }
    }

    const uniqueName = `${Date.now()}-${baseName}-${randomUUID().slice(0, 8)}${finalExtension}`;

    if (isCloudinaryConfigured() && !forceLocalStorage) {
      const folder = isImage ? "kavukattu/images" : "kavukattu/files";
      const publicId = isImage ? uniqueName.slice(0, Math.max(1, uniqueName.length - finalExtension.length)) : uniqueName;
      const uploadedAsset = await uploadBufferToCloudinary({
        buffer,
        filename: safeName,
        folder,
        resourceType: isImage ? "image" : "raw",
        publicId,
      });

      return NextResponse.json({
        url: uploadedAsset.url,
        filename: safeName,
        contentType,
        storage: "cloudinary",
        compressed: shouldCompressImage(file.type, safeName),
      });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, uniqueName), buffer);

    return NextResponse.json({
      url: `/uploads/${uniqueName}`,
      filename: uniqueName,
      contentType,
      storage: "local",
      compressed: shouldCompressImage(file.type, safeName),
    });
  } catch (error) {
    console.error("Upload error:", error);

    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "Upload failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const fileUrl = req.nextUrl.searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    if (fileUrl.startsWith("https://res.cloudinary.com/")) {
      const deleted = await deleteCloudinaryAssetByUrl(fileUrl);

      if (!deleted) {
        return NextResponse.json({ error: "Cloud asset not found." }, { status: 404 });
      }

      return NextResponse.json({ deleted: true });
    }

    const filePath = getUploadFilePath(fileUrl);
    if (!filePath) {
      return NextResponse.json({ error: "Only uploaded files can be removed." }, { status: 400 });
    }

    await unlink(filePath);

    return NextResponse.json({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    console.error("Upload delete error:", error);
    return NextResponse.json({ error: "Failed to remove file" }, { status: 500 });
  }
}
