import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function getAdminId() {
  const session = await getSession();
  return session?.id || null;
}
