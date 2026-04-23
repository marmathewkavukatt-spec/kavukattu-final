import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCookieName, verifyToken } from "@/lib/auth-session";
import { isContributionStatus, isContributionType } from "@/lib/contributions";
import { parseDateRangeFromSearchParams } from "@/lib/query-date-range";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, address, description } = body;

    if (!type || !name || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const contribution = await db.contribution.create({
      data: {
        type,
        name,
        address: address || null,
        description,
        status: "pending",
      },
      select: {
        id: true,
        type: true,
        name: true,
        address: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getCookieName())?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const requestedPage = Math.max(1, Number(searchParams.get("page") || "1") || 1);
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit") || "50") || 50), 100); // Max 100 items

    // Build where clause with validated inputs
    const where: any = {};
    if (isContributionType(type)) {
      where.type = type;
    }
    if (isContributionStatus(status)) {
      where.status = status;
    }

    const { start, endExclusive, error } = parseDateRangeFromSearchParams(searchParams);
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
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);
    const skip = (page - 1) * limit;

    const contributions = await db.contribution.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        name: true,
        address: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      contributions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      }
    });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}
