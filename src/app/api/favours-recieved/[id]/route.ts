import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toRequiredString,
} from "@/lib/requestValidation";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const favourRecieved = await db.favourReceived.findUnique({
      where: { id: ensureRecordId(params.id) },
    });

    if (!favourRecieved) {
      return NextResponse.json({ error: "Favour Recieved not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: favourRecieved.id,
      authorName: favourRecieved.authorName,
      content: favourRecieved.content,
      authorImage: favourRecieved.authorImage,
      order: favourRecieved.order,
      active: favourRecieved.active,
      createdAt: favourRecieved.createdAt,
      updatedAt: favourRecieved.updatedAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch favour recieved" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    const payload = await getSafeJsonBody(req);

    const favourRecieved = await db.favourReceived.update({
      where: { id: ensureRecordId(params.id) },
      data: {
        authorName: toRequiredString(payload.authorName, "authorName", { maxLength: 120 }),
        content: toRequiredString(payload.content, "content", { maxLength: 5000 }),
        authorImage: payload.authorImage ? toAssetUrl(payload.authorImage, "authorImage") : undefined,
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });

    revalidatePath('/');
    return NextResponse.json(favourRecieved);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update favour recieved" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {    await db.favourReceived.delete({
      where: { id: ensureRecordId(params.id) },
    });

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete favour recieved" }, { status: 500 });
  }
}
