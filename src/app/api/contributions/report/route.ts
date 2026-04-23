import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCookieName, verifyToken } from "@/lib/auth-session";
import { isContributionStatus, isContributionType } from "@/lib/contributions";
import { parseDateRangeFromSearchParams } from "@/lib/query-date-range";
import path from "node:path";
import fs from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REPORT_RECORDS = 5000;

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function safeFilenamePart(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function getLogoPath() {
  const candidate = path.join(process.cwd(), "public", "uploads", "logo.jpg");
  return fs.existsSync(candidate) ? candidate : null;
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = {};
    if (isContributionType(type)) where.type = type;
    if (isContributionStatus(status)) where.status = status;

    const { start, endExclusive, error, tzOffsetMinutes } = parseDateRangeFromSearchParams(searchParams);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    if (start || endExclusive) {
      where.createdAt = {
        ...(start ? { gte: start } : {}),
        ...(endExclusive ? { lt: endExclusive } : {}),
      };
    }

    const total = await db.contribution.count({ where });
    if (total > MAX_REPORT_RECORDS) {
      return NextResponse.json(
        { error: `Too many records (${total}). Please narrow the date range (max ${MAX_REPORT_RECORDS}).` },
        { status: 413 },
      );
    }

    const contributions = await db.contribution.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        name: true,
        address: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });

    const { default: PDFDocument } = await import("pdfkit");

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      info: {
        Title: "Public Interventions Report",
        Author: "Kavukatt Admin",
      },
    });

    // Collect PDF chunks
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    
    // Wait for PDF to finish
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Format dates using the admin user's timezone offset (avoids server timezone differences).
    const formatLocalDate = (date: Date) => {
      const local = new Date(date.getTime() - tzOffsetMinutes * 60_000);
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(local);
    };

    const formatLocalDateTime = (date: Date) => {
      const local = new Date(date.getTime() - tzOffsetMinutes * 60_000);
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(local);
    };

    const logoPath = getLogoPath();
    if (logoPath) {
      doc.image(logoPath, doc.page.margins.left, 35, { width: 52, height: 52 });
    }

    doc
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .fontSize(20)
      .text("Public Interventions Report", doc.page.margins.left, 42, {
        width: pageWidth,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#475569")
      .text(`Generated: ${formatLocalDateTime(new Date())}`, { align: "right" });

    const typeLabel = isContributionType(type) ? type : "All";
    const statusLabel = isContributionStatus(status) ? status : "All";
    const fromLabel = searchParams.get("from") ?? "Any";
    const toLabel = searchParams.get("to") ?? "Any";

    doc
      .moveDown(0.6)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#334155")
      .text(`Category: ${typeLabel}   •   Status: ${statusLabel}`, { width: pageWidth })
      .text(`Date range: ${fromLabel} to ${toLabel}`, { width: pageWidth })
      .text(`Total records: ${total}`, { width: pageWidth });

    doc
      .moveDown(0.6)
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();

    doc.moveDown(1);

    const grouped = new Map<string, typeof contributions>();
    for (const item of contributions) {
      const key = item.type;
      const existing = grouped.get(key);
      if (existing) existing.push(item);
      else grouped.set(key, [item]);
    }

    const orderedTypes = isContributionType(type)
      ? [type]
      : ["Testimonials", "Prayer Requests", "Intentions"];

    for (const groupType of orderedTypes) {
      const items = grouped.get(groupType) ?? [];

      doc
        .font("Helvetica-Bold")
        .fillColor("#0f172a")
        .fontSize(14)
        .text(groupType, { width: pageWidth });

      doc.moveDown(0.3);

      if (items.length === 0) {
        doc
          .font("Helvetica")
          .fillColor("#64748b")
          .fontSize(10)
          .text("No records for this category.", { width: pageWidth });
        doc.moveDown(1);
        continue;
      }

      for (const item of items) {
        const dateStr = formatLocalDate(item.createdAt);

        doc
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .fontSize(11)
          .text(`${dateStr}  •  ${item.name}`, { width: pageWidth });

        if (item.address) {
          doc
            .font("Helvetica")
            .fillColor("#64748b")
            .fontSize(9)
            .text(item.address, { width: pageWidth });
        }

        doc
          .font("Helvetica")
          .fillColor("#334155")
          .fontSize(10)
          .text(item.description, { width: pageWidth, paragraphGap: 6 });

        doc
          .strokeColor("#e2e8f0")
          .lineWidth(1)
          .moveTo(doc.page.margins.left, doc.y)
          .lineTo(doc.page.width - doc.page.margins.right, doc.y)
          .stroke();

        doc.moveDown(0.8);
      }

      doc.moveDown(0.5);
    }

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .font("Helvetica")
        .fillColor("#94a3b8")
        .fontSize(9)
        .text(`Page ${i - range.start + 1} of ${range.count}`, 0, doc.page.height - 35, {
          align: "center",
        });
    }

    doc.end();

    // Wait for PDF generation to complete
    const pdfBuffer = await pdfPromise;

    const reportParts: string[] = ["public-contributions"];
    if (isContributionType(type)) reportParts.push(safeFilenamePart(type));
    const fromForName = searchParams.get("from");
    const toForName = searchParams.get("to");
    if (fromForName) reportParts.push(fromForName);
    if (toForName) reportParts.push(`to-${toForName}`);

    const filename = `${reportParts.join("_")}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}
