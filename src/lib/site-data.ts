import { db } from "@/lib/db";
import { getAbsoluteSiteUrl } from "@/lib/site-url";
import { withUnderscoreId, withUnderscoreIds } from "@/lib/prisma-helpers";
import { cachedQuery } from "@/lib/api-optimizer";

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

export interface PublicSlide {
  _id: string;
  image: string;
  title?: string;
  subtitle?: string;
  order: number;
}

export interface PublicResource {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  linkUrl?: string;
  order: number;
}

export type ArchiveCategory = "PASTORAL_LETTERS" | "CIRCULARS" | "OTHERS" | string;

export interface PublicArchiveDocument {
  _id: string;
  category: string;
  title?: string;
  subtitle?: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
}

export interface PublicAnnouncement {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  content: string;
  category: string;
  coverImage?: string;
  fileUrl?: string;
  date: string;
}

export interface PublicAnnouncementCard {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  coverImage?: string;
  date: string;
}

export interface PublicGalleryItem {
  _id: string;
  image: string;
  caption?: string;
  order: number;
}

export interface PublicGalleryCategory {
  _id: string;
  title: string;
  coverImage: string;
  order: number;
  active: boolean;
}

export interface PublicGalleryCategoryItem {
  _id: string;
  categoryId: string;
  image: string;
  title?: string;
  order: number;
}

export interface PublicTestimony {
  _id: string;
  authorName: string;
  content: string;
  authorImage?: string;
  order: number;
}

export interface PublicTiming {
  _id: string;
  title: string;
  description?: string;
  schedule: string;
  order: number;
}

export async function getPublicSlides(): Promise<PublicSlide[]> {
  return cachedQuery(
    'site-data:slides',
    async () => {
      try {
        const items = await db.slider.findMany({
          where: { active: true },
          orderBy: { order: "asc" },
          select: { id: true, image: true, title: true, subtitle: true, order: true },
        });
        return items.map((item) => ({
          _id: item.id,
          image: item.image,
          title: nullToUndefined(item.title),
          subtitle: nullToUndefined(item.subtitle),
          order: item.order,
        }));
      } catch {
        return [];
      }
    },
    300 // 5 minutes cache
  );
}

export async function getPublicResources(): Promise<PublicResource[]> {
  try {    const items = await db.resource.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true, description: true, fileUrl: true, linkUrl: true, order: true },
    });
    return items.map((item) => ({
      _id: item.id,
      title: item.title,
      description: nullToUndefined(item.description),
      fileUrl: nullToUndefined(item.fileUrl),
      linkUrl: nullToUndefined(item.linkUrl),
      order: item.order,
    }));
  } catch {
    // console.error("[site-data] Failed to load resources:", error);
    return [];
  }
}

export async function getPublicResourceById(id: string): Promise<PublicResource | null> {
  try {
    const item = await db.resource.findUnique({
      where: { id },
      select: { id: true, title: true, description: true, fileUrl: true, linkUrl: true, order: true },
    });

    if (!item) return null;

    return {
      _id: item.id,
      title: item.title,
      description: nullToUndefined(item.description),
      fileUrl: nullToUndefined(item.fileUrl),
      linkUrl: nullToUndefined(item.linkUrl),
      order: item.order,
    };
  } catch {
    return null;
  }
}

const ARCHIVE_CATEGORIES = ["PASTORAL_LETTERS", "CIRCULARS", "OTHERS"] as const;

function isArchiveCategory(value: unknown): value is ArchiveCategory {
  return typeof value === "string" && (ARCHIVE_CATEGORIES as readonly string[]).includes(value);
}

export async function getPublicArchiveDocuments(category?: string): Promise<PublicArchiveDocument[]> {
  try {
    const items = await db.archiveDocument.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        category: true,
        title: true,
        subtitle: true,
        description: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return items.map((item) => ({
      _id: item.id,
      category: item.category,
      title: nullToUndefined(item.title),
      subtitle: nullToUndefined(item.subtitle),
      description: nullToUndefined(item.description),
      fileUrl: item.fileUrl,
      fileName: nullToUndefined(item.fileName),
      fileType: nullToUndefined(item.fileType),
      fileSize: item.fileSize ?? undefined,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getPublicArchiveDocumentById(id: string): Promise<PublicArchiveDocument | null> {
  try {
    const item = await db.archiveDocument.findUnique({
      where: { id },
      select: {
        id: true,
        category: true,
        title: true,
        subtitle: true,
        description: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    if (!item) return null;

    return {
      _id: item.id,
      category: item.category,
      title: nullToUndefined(item.title),
      subtitle: nullToUndefined(item.subtitle),
      description: nullToUndefined(item.description),
      fileUrl: item.fileUrl,
      fileName: nullToUndefined(item.fileName),
      fileType: nullToUndefined(item.fileType),
      fileSize: item.fileSize ?? undefined,
      createdAt: item.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getPublicAnnouncementCards(): Promise<PublicAnnouncementCard[]> {
  return cachedQuery(
    'site-data:announcement-cards',
    async () => {
      try {
        const items = await db.announcement.findMany({
          where: { active: true },
          orderBy: { date: "desc" },
          select: {
            id: true,
            title: true,
            subtitle: true,
            description: true,
            category: true,
            coverImage: true,
            date: true,
          },
        });

        return items.map((item) => ({
          _id: item.id,
          title: item.title,
          subtitle: nullToUndefined(item.subtitle),
          description: nullToUndefined(item.description),
          category: item.category,
          coverImage: nullToUndefined(item.coverImage),
          date: item.date.toISOString(),
        }));
      } catch {
        return [];
      }
    },
    300 // 5 minutes cache
  );
}

export async function getPublicAnnouncements(): Promise<PublicAnnouncement[]> {
  try {    const items = await db.announcement.findMany({
      where: { active: true },
      orderBy: { date: "desc" },
      select: { id: true, title: true, subtitle: true, description: true, content: true, category: true, coverImage: true, fileUrl: true, date: true },
    });
    return items.map((item) => ({
      _id: item.id,
      title: item.title,
      subtitle: nullToUndefined(item.subtitle),
      description: nullToUndefined(item.description),
      content: item.content,
      category: item.category,
      coverImage: nullToUndefined(item.coverImage),
      fileUrl: nullToUndefined(item.fileUrl),
      date: item.date.toISOString(),
    }));
  } catch {
    // console.error("[site-data] Failed to load announcements:", error);
    return [];
  }
}

export async function getPublicGallery(): Promise<PublicGalleryItem[]> {
  try {    const items = await db.gallery.findMany({
      orderBy: { order: "asc" },
      select: { id: true, image: true, caption: true, order: true },
    });
    return items.map((item) => ({
      _id: item.id,
      image: item.image,
      caption: nullToUndefined(item.caption),
      order: item.order,
    }));
  } catch {
    // console.error("[site-data] Failed to load gallery:", error);
    return [];
  }
}

export async function getPublicGalleryCategories(): Promise<PublicGalleryCategory[]> {
  return cachedQuery(
    'site-data:gallery-categories',
    async () => {
      try {
        const items = await db.galleryCategory.findMany({
          where: { active: true },
          orderBy: { order: "asc" },
          select: { id: true, title: true, coverImage: true, order: true, active: true },
        });
        return items.map((item) => ({
          _id: item.id,
          title: item.title,
          coverImage: item.coverImage,
          order: item.order,
          active: item.active,
        }));
      } catch {
        return [];
      }
    },
    300 // 5 minutes cache
  );
}

export async function getPublicGalleryCategoryWithItems(categoryId: string): Promise<{ category: PublicGalleryCategory | null; items: PublicGalleryCategoryItem[] }> {
  try {
    // OPTIMIZED: Single query with include instead of N+1
    const categoryDoc = await db.galleryCategory.findUnique({
      where: { id: categoryId },
      select: { 
        id: true, 
        title: true, 
        coverImage: true, 
        order: true, 
        active: true,
        items: {
          orderBy: { order: "asc" },
          select: { id: true, categoryId: true, image: true, title: true, order: true }
        }
      },
    });
    
    if (!categoryDoc?.active) {
      return { category: null, items: [] };
    }
    
    const { items, ...category } = categoryDoc;
    
    return {
      category: withUnderscoreId(category),
      items: items.map((item) => ({
        _id: item.id,
        categoryId: item.categoryId,
        image: item.image,
        title: nullToUndefined(item.title),
        order: item.order,
      })),
    };
  } catch {
    // console.error("[site-data] Failed to load gallery category:", error);
    return { category: null, items: [] };
  }
}

export async function getPublicTestimonies(): Promise<PublicTestimony[]> {
  try {    const items = await db.testimony.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, authorName: true, content: true, authorImage: true, order: true },
    });

    const plain: PublicTestimony[] = items.map((item) => ({
      _id: item.id,
      authorName: item.authorName,
      content: item.content,
      authorImage: nullToUndefined(item.authorImage),
      order: item.order,
    }));
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

    if (!cloudName) {
      return plain;
    }

    return plain.map((item) => {
      const authorImage = item.authorImage;

      if (!authorImage || !authorImage.startsWith("/uploads/")) {
        return item;
      }

      const absoluteUrl = getAbsoluteSiteUrl(authorImage);

      try {
        const parsed = new URL(absoluteUrl);
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          return item;
        }
      } catch {
        return item;
      }

      return {
        ...item,
        authorImage: `https://res.cloudinary.com/${cloudName}/image/fetch/${encodeURIComponent(absoluteUrl)}`,
      };
    });
  } catch {
    // console.error("[site-data] Failed to load testimonies:", error);
    return [];
  }
}

export async function getPublicTimings(): Promise<PublicTiming[]> {
  try {    const items = await db.timing.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true, description: true, schedule: true, order: true },
    });
    return items.map((item) => ({
      _id: item.id,
      title: item.title,
      description: nullToUndefined(item.description),
      schedule: item.schedule,
      order: item.order,
    }));
  } catch {
    // console.error("[site-data] Failed to load timings:", error);
    return [];
  }
}
