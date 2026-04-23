import { NextResponse } from "next/server";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const experiences = await db.experience.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      experiences.map((exp) => ({
        _id: exp.id,
        authorName: exp.authorName,
        content: exp.content,
        authorImage: exp.authorImage,
        order: exp.order,
        active: exp.active,
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}
