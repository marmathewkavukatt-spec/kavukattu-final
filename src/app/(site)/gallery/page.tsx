import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import GalleryCategoriesGrid from "@/components/GalleryCategoriesGrid";
import { getPublicGalleryCategories } from "@/lib/site-data";
import { generatePageMetadata, seoConfig } from "@/lib/seo-config";

export const metadata = generatePageMetadata({
  title: "Gallery - Photos and Memories",
  description: "Explore our photo gallery featuring images of Mar Mathew Kavukatt, religious ceremonies, church events, and community celebrations. Discover the visual heritage of our faith community.",
  keywords: seoConfig.keywords.gallery,
  path: "/gallery",
  type: "website"
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GalleryPage() {
  const categories = await getPublicGalleryCategories();
  
  return (
    <div className="bg-stone-50">
      {/* Colored Header Section */}
      <div className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeading textKey="pageGallery" className="text-white" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {categories.length > 0 ? (
          <GalleryCategoriesGrid categories={categories} />
        ) : (
          <EmptyState textKey="emptyGallery" />
        )}
      </div>
    </div>
  );
}
