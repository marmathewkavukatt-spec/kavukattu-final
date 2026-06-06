import { NextResponse } from "next/server";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const favoursRecieved = await db.favourReceived.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      favoursRecieved.map((item) => ({
        _id: item.id,
        authorName: item.authorName,
        content: item.content,
        authorImage: item.authorImage,
        order: item.order,
        active: item.active,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch favours recieved" }, { status: 500 });
  }
}
