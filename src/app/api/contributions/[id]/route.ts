import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCookieName, verifyToken } from "@/lib/auth-session";
import { isContributionStatus } from "@/lib/contributions";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    await db.contribution.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { error: "Failed to delete contribution" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    const body = await request.json();
    const { status } = body;

    if (!isContributionStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const contribution = await db.contribution.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error("Error updating contribution:", error);
    return NextResponse.json(
      { error: "Failed to update contribution" },
      { status: 500 }
    );
  }
}
