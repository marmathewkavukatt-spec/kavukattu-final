import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { RequestValidationError, getSafeJsonBody } from "@/lib/requestValidation";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendProgress = async (data: { deleted: number; total: number; current?: string; error?: string }) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    try {      const payload = await getSafeJsonBody(req);
      
      if (!Array.isArray(payload.ids) || payload.ids.length === 0) {
        await sendProgress({ deleted: 0, total: 0, error: "No IDs provided" });
        await writer.close();
        return;
      }

      const ids = payload.ids as string[];
      const total = ids.length;

      await sendProgress({ deleted: 0, total });
      await db.$transaction([
        db.galleryItem.deleteMany({ where: { categoryId: { in: ids } } }),
        db.galleryCategory.deleteMany({ where: { id: { in: ids } } }),
      ]);
      await sendProgress({ deleted: total, total });

      revalidatePath('/gallery');
      revalidatePath('/');
      for (const id of ids) {
        revalidatePath(`/gallery/${id}`);
      }
      
      await writer.close();
    } catch (error) {
      if (error instanceof RequestValidationError) {
        await sendProgress({ deleted: 0, total: 0, error: error.message });
      } else {
        console.error(error);
        await sendProgress({ deleted: 0, total: 0, error: "Server error" });
      }
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
