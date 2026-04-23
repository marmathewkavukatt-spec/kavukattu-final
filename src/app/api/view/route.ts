import { NextRequest, NextResponse } from "next/server";
import {
  RequestValidationError,
  sanitizeFilename,
  toAssetUrl,
} from "@/lib/requestValidation";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
    }

    const viewUrl = toAssetUrl(url, "url");
    
    // Allow both Cloudinary URLs and local file paths
    if (!viewUrl.startsWith("https://res.cloudinary.com/") &&
        !viewUrl.startsWith("/uploads/")) {
      throw new RequestValidationError("Only approved asset hosts can be viewed.");
    }

    const filename = sanitizeFilename(
      req.nextUrl.searchParams.get("filename") || viewUrl.split("/").pop() || "file",
      "file",
    );

    let buffer: Buffer;
    let contentType = "application/octet-stream";

    // Handle local file paths differently
    if (viewUrl.startsWith("/uploads/")) {
      try {
        const filePath = join(process.cwd(), "public", viewUrl);
        buffer = await readFile(filePath);
      } catch (error) {
        console.error("File read error:", error);
        return NextResponse.json({ error: "Failed to fetch file" }, { status: 404 });
      }
    } else {
      // Build absolute URL for API paths or external URLs
      let fetchUrl = viewUrl;
      if (viewUrl.startsWith("/")) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                        process.env.NEXT_PUBLIC_BASE_URL || 
                        `${req.nextUrl.protocol}//${req.nextUrl.host}`;
        fetchUrl = `${baseUrl}${viewUrl}`;
      }

      const response = await fetch(fetchUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
      }

      const blob = await response.blob();
      buffer = Buffer.from(await blob.arrayBuffer());
      contentType = blob.type || "application/octet-stream";
    }

    if (contentType === "application/octet-stream" || !contentType) {
      if (filename.toLowerCase().endsWith('.pdf')) {
        contentType = "application/pdf";
      } else if (filename.toLowerCase().match(/\.(doc|docx)$/)) {
        contentType = "application/msword";
      } else if (filename.toLowerCase().match(/\.(xls|xlsx)$/)) {
        contentType = "application/vnd.ms-excel";
      }
    }

    // Use inline disposition for viewing in browser
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("View error:", error);
    return NextResponse.json({ error: "View failed" }, { status: 500 });
  }
}
