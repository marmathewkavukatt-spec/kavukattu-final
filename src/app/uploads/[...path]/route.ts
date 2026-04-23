import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getContentTypeByExtension(pathname: string) {
  const ext = extname(pathname).toLowerCase();
  switch (ext) {
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".csv":
      return "text/csv; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function getUploadsAbsolutePath(requestedPath: string) {
  if (!requestedPath.startsWith("/uploads/")) return null;

  const publicDir = resolve(process.cwd(), "public");
  const uploadDir = resolve(publicDir, "uploads");
  const absolutePath = resolve(publicDir, requestedPath.replace(/^\/+/, ""));
  const uploadRelativePath = relative(uploadDir, absolutePath);

  if (!uploadRelativePath || uploadRelativePath.startsWith("..")) {
    return null;
  }

  return absolutePath;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const requestedPath = `/uploads/${path.join("/")}`;

  const absolutePath = getUploadsAbsolutePath(requestedPath);
  if (!absolutePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const stream = createReadStream(absolutePath);

    // Node stream -> Web stream
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    const contentType = getContentTypeByExtension(absolutePath);
    const cacheControl = requestedPath.match(/^\/*uploads\/\d{10,}-/)
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600";

    return new NextResponse(readable, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": cacheControl,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
