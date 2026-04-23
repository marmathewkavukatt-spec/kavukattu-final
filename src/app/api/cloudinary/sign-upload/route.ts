import { randomUUID } from "crypto";
import { extname } from "path";
import { NextRequest, NextResponse } from "next/server";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  getSafeJsonBody,
  sanitizeFilename,
  toRequiredString,
} from "@/lib/requestValidation";
import {
  getMaxUploadBytes,
  getNormalizedExtension,
  isAllowedUpload,
  isImageUpload,
} from "@/lib/upload-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toFileSizeBytes(value: unknown, fieldName: string) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    if (parsed === 0) {
      throw new RequestValidationError("File is empty.");
    }

    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  return parsed;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 503 },
    );
  }

  try {
    const payload = await getSafeJsonBody(req);

    const filename = toRequiredString(payload.filename, "filename", {
      maxLength: 240,
    });
    const contentType =
      typeof payload.contentType === "string" ? payload.contentType : "";
    const size = toFileSizeBytes(payload.size, "size");

    const safeName = sanitizeFilename(filename, "upload");

    if (!isAllowedUpload({ contentType, filename: safeName })) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Upload an image, PDF, Word, Excel, PowerPoint, RTF, or text file.",
        },
        { status: 400 },
      );
    }

    const maxSize = getMaxUploadBytes({ contentType, filename: safeName });
    if (size > maxSize) {
      const sizeMb = (size / (1024 * 1024)).toFixed(2);
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large (${sizeMb}MB). Max ${maxMb}MB.` },
        { status: 400 },
      );
    }

    const extension = getNormalizedExtension(safeName);
    const baseName =
      safeName.slice(0, Math.max(0, safeName.length - extension.length)) ||
      "upload";
    const uniqueName = `${Date.now()}-${baseName}-${randomUUID().slice(0, 8)}${extension}`;
    const isImage = isImageUpload({ contentType, filename: safeName });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary is not configured." },
        { status: 503 },
      );
    }

    const folder = isImage ? "kavukattu/images" : "kavukattu/files";
    const publicId = isImage
      ? uniqueName.slice(
          0,
          Math.max(1, uniqueName.length - extname(uniqueName).length),
        )
      : uniqueName;
    const resourceType = isImage ? "image" : "raw";
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        public_id: publicId,
        timestamp,
      },
      apiSecret,
    );

    return NextResponse.json({
      url: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      fields: {
        api_key: apiKey,
        folder,
        public_id: publicId,
        timestamp,
        signature,
      },
      resourceType,
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Cloudinary sign-upload error:", error);
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
