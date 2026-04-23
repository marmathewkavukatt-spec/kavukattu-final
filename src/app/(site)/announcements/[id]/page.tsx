import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import { db, connectDB } from "@/lib/db";

export const revalidate = 120;

interface Props {
  params: Promise<{ id: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  "upcoming-events": "Upcoming Events",
  "feast-days": "Feast Days",
  "special-prayers": "Special Prayers",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    await connectDB();
    const announcement = await db.announcement.findUnique({
      where: { id, active: true },
      select: { title: true },
    });
    if (!announcement) return { title: "Not Found" };
    return { title: `${announcement.title} - Announcements - Kavukattu` };
  } catch {
    return { title: "Announcement - Kavukattu" };
  }
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { id } = await params;
  
  let announcement;
  try {
    await connectDB();
    announcement = await db.announcement.findUnique({
      where: { id, active: true },
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    notFound();
  }
  
  if (!announcement) {
    notFound();
  }

  const categoryLabel = CATEGORY_LABELS[announcement.category] || announcement.category;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <BackButton />

        <article className="mt-6">
          {/* Hero Image Section */}
          {announcement.coverImage ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-md">
              <img
                src={announcement.coverImage}
                alt={announcement.title}
                className="h-full w-full object-cover"
              />
              
              {/* Category Badge on Image */}
              <div className="absolute top-4 left-4">
                <span className="inline-block rounded px-3 py-1.5 text-sm font-semibold bg-accent text-white shadow-sm">
                  {categoryLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-br from-stone-200 to-stone-300 shadow-md flex items-center justify-center">
              <svg className="w-24 h-24 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-block rounded px-3 py-1.5 text-sm font-semibold bg-accent text-white shadow-sm">
                  {categoryLabel}
                </span>
              </div>
            </div>
          )}

          {/* Content Card */}
          <div className="mt-6 rounded-lg bg-white p-6 sm:p-8 shadow-sm">
            {/* Meta Info */}
            <div className="flex items-center gap-2 text-accent mb-4">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time className="text-sm font-semibold" dateTime={announcement.date.toISOString()}>
                {formatDate(announcement.date)}
              </time>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
              {announcement.title}
            </h1>
            
            {/* Subtitle */}
            {announcement.subtitle && (
              <p className="mt-3 text-lg text-stone-700">
                {announcement.subtitle}
              </p>
            )}

            {/* Divider */}
            <div className="my-6 h-px bg-stone-200" />

            {/* Description Highlight */}
            {announcement.description && (
              <div className="mb-6 rounded-lg bg-stone-50 p-5 border-l-4 border-accent">
                <p className="text-base leading-relaxed text-stone-700 whitespace-pre-line">
                  {announcement.description}
                </p>
              </div>
            )}
            
            {/* Main Content */}
            <div className="prose prose-stone max-w-none">
              <div className="whitespace-pre-line text-stone-700 leading-relaxed text-base">
                {announcement.content}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
