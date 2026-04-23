import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import ArchiveCategoryTabs, { type ArchiveCategorySlug } from "@/components/ArchiveCategoryTabs";
import PaginatedArchiveDocuments from "@/components/PaginatedArchiveDocuments";
import { getPublicArchiveDocuments, type ArchiveCategory } from "@/lib/site-data";

export const metadata = { title: "Kavukattu", description: "Archives and documents" };
export const revalidate = 300;

function slugToCategory(slug: string): ArchiveCategory | undefined {
  const normalized = slug.trim().toLowerCase();
  if (normalized === "pastoral-letters") return "PASTORAL_LETTERS";
  if (normalized === "circulars") return "CIRCULARS";
  if (normalized === "others") return "OTHERS";
  return undefined;
}

function getActiveSlug(slug: string | undefined): ArchiveCategorySlug {
  const normalized = (slug ?? "").trim().toLowerCase();
  if (normalized === "pastoral-letters") return "pastoral-letters";
  if (normalized === "circulars") return "circulars";
  if (normalized === "others") return "others";
  return "all";
}

export default async function ArchivesPage({ searchParams }: { searchParams?: { category?: string } }) {
  const categorySlug = searchParams?.category;
  const category = categorySlug ? slugToCategory(categorySlug) : undefined;
  const items = await getPublicArchiveDocuments(category);

  return (
    <div className="bg-stone-50">
      {/* Colored Header Section */}
      <div className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeading textKey="pageArchives" className="text-white" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ArchiveCategoryTabs active={getActiveSlug(categorySlug)} />
        {items.length ? <PaginatedArchiveDocuments items={items} /> : <EmptyState textKey="emptyArchives" />}
      </div>
    </div>
  );
}

