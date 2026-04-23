import { NextResponse } from "next/server";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { withUnderscoreIds } from "@/lib/prisma-helpers";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const items = await db.announcement.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(withUnderscoreIds(items));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
