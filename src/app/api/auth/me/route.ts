import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, connectDB } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  if (typeof session.email === "string" && session.email.trim()) {
    return NextResponse.json({ authenticated: true, id: session.id, email: session.email });
  }

  try {    const admin = await db.admin.findUnique({
      where: { id: session.id },
      select: { email: true },
    });

    if (!admin?.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, id: session.id, email: admin.email });
  } catch (error) {
    console.error("Failed to load admin profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
