import { NextRequest, NextResponse } from "next/server";
import {
  RequestValidationError,
  sanitizeFilename,
  toAssetUrl,
} from "@/lib/requestValidation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
    }

    const downloadUrl = toAssetUrl(url, "url");
    if (!downloadUrl.startsWith("https://res.cloudinary.com/")) {
      throw new RequestValidationError("Only approved asset hosts can be downloaded.");
    }

    const filename = sanitizeFilename(
      req.nextUrl.searchParams.get("filename") || downloadUrl.split("/").pop() || "download",
      "download",
    );

    const response = await fetch(downloadUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    let contentType = blob.type || "application/octet-stream";

    if (contentType === "application/octet-stream" || !contentType) {
      if (filename.toLowerCase().endsWith('.pdf')) {
        contentType = "application/pdf";
      } else if (filename.toLowerCase().match(/\.(doc|docx)$/)) {
        contentType = "application/msword";
      } else if (filename.toLowerCase().match(/\.(xls|xlsx)$/)) {
        contentType = "application/vnd.ms-excel";
      }
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
