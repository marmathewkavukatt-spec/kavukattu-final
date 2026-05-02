import FilteredAnnouncements from "@/components/FilteredAnnouncements";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import { getPublicAnnouncementCards } from "@/lib/site-data";
import { generatePageMetadata, seoConfig } from "@/lib/seo-config";

export const metadata = generatePageMetadata({
  title: "Announcements - Latest News and Events",
  description: "Stay updated with the latest announcements, news, and events from Mar Mathew Kavukatt Foundation. Find information about religious celebrations, community events, and important updates.",
  keywords: seoConfig.keywords.announcements,
  path: "/announcements",
  type: "website"
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnnouncementsPage() {
  const announcements = await getPublicAnnouncementCards();
  return (
    <div className="bg-stone-50">
      {/* Colored Header Section */}
      <div className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeading textKey="pageAnnouncements" className="text-white" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {announcements.length
          ? <FilteredAnnouncements items={announcements} />
          : <EmptyState textKey="emptyAnnouncements" />}
      </div>
    </div>
  );
}
