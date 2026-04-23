import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { getSession } from "@/lib/auth";
import {
  RequestValidationError,
  ensureRecordId,
  getSafeJsonBody,
  toAssetUrl,
  toBoolean,
  toNumber,
  toRequiredString,
} from "@/lib/requestValidation";
import { isPrismaNotFoundError, withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";

// Public/Admin endpoint - get single category with its items
// OPTIMIZED: Single query with include instead of N+1 queries
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    
    // Single optimized query with items included
    const category = await db.galleryCategory.findUnique({ 
      where: { id: ensureRecordId(id) },
      include: {
        items: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            categoryId: true,
            image: true,
            title: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    
    // Only check active status for non-admin users
    if (!session && !category.active) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    
    const { items, ...categoryData } = category;
    
    return NextResponse.json({ 
      category: withUnderscoreId(categoryData), 
      items: withUnderscoreIds(items) 
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Admin endpoint - update category
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    const payload = await getSafeJsonBody(req);
    
    const category = await db.galleryCategory.update({
      where: { id: ensureRecordId(id) },
      data: {
        title: toRequiredString(payload.title, "title", { maxLength: 200 }),
        coverImage: toAssetUrl(payload.coverImage, "coverImage"),
        order: toNumber(payload.order, "order", { min: 0, max: 9999, defaultValue: 0 }),
        active: toBoolean(payload.active, true),
      },
    });
    revalidatePath('/gallery');
    revalidatePath(`/gallery/${id}`);
    revalidatePath('/');
    return NextResponse.json(withUnderscoreId(category));
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Admin endpoint - delete category and all its items
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {    const { id } = await params;
    
    const recordId = ensureRecordId(id);

    await db.$transaction([
      db.galleryItem.deleteMany({ where: { categoryId: recordId } }),
      db.galleryCategory.delete({ where: { id: recordId } }),
    ]);
    
    revalidatePath('/gallery');
    revalidatePath(`/gallery/${recordId}`);
    revalidatePath('/');
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
