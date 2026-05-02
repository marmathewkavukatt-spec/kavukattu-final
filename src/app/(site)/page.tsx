import HeroSlider from "@/components/HeroSlider";
import HomeAnnouncementsSection from "@/components/HomeAnnouncementsSection";
import HomeHistorySection from "@/components/HomeHistorySection";
import AdministratorsSection from "@/components/AdministratorsSection";
import TimelineSection from "@/components/TimelineSection";
import PrayerSection from "@/components/PrayerSection";
import QuotesMessagesSection from "@/components/QuotesMessagesSection";
import HomeGallerySection from "@/components/HomeGallerySection";
import QuickLinksSection from "@/components/QuickLinksSection";
import { getPublicAnnouncementCards, getPublicSlides, getPublicGalleryCategories } from "@/lib/site-data";
import { generatePageMetadata, seoConfig } from "@/lib/seo-config";

export const metadata = generatePageMetadata({
  title: "Mar Mathew Kavukatt - First Archbishop of Changanacherry | Servant of God",
  description: seoConfig.siteDescription,
  keywords: seoConfig.keywords.general,
  path: "/",
  type: "website"
});

export default async function HomePage() {
  let slides: Awaited<ReturnType<typeof getPublicSlides>> = [];
  let announcements: Awaited<ReturnType<typeof getPublicAnnouncementCards>> = [];
  let galleryCategories: Awaited<ReturnType<typeof getPublicGalleryCategories>> = [];

  const [slidesResult, announcementsResult, galleryResult] = await Promise.allSettled([
    getPublicSlides(),
    getPublicAnnouncementCards(),
    getPublicGalleryCategories(),
  ]);

  if (slidesResult.status === "fulfilled") slides = slidesResult.value;
  else console.error("Failed to load slides:", slidesResult.reason);

  if (announcementsResult.status === "fulfilled") announcements = announcementsResult.value;
  else console.error("Failed to load announcements:", announcementsResult.reason);

  if (galleryResult.status === "fulfilled") galleryCategories = galleryResult.value;
  else console.error("Failed to load gallery categories:", galleryResult.reason);

  return (
    <>
      <HeroSlider slides={slides} />
      <AdministratorsSection />
      <HomeHistorySection />
      <TimelineSection />
      <PrayerSection />
      <QuotesMessagesSection />
      <HomeAnnouncementsSection announcements={announcements} />
      <HomeGallerySection categories={galleryCategories} />
      <QuickLinksSection />
    </>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
