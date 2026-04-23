import PaginatedResources from "@/components/PaginatedResources";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import { getPublicResources } from "@/lib/site-data";

export const metadata = { title: "Kavukattu", description: "Church resources and materials" };
export const revalidate = 300;

export default async function ResourcesPage() {
  const resources = await getPublicResources();
  return (
    <div className="bg-stone-50">
      {/* Colored Header Section */}
      <div className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeading textKey="pageResources" className="text-white" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {resources.length
          ? <PaginatedResources items={resources} />
          : <EmptyState textKey="emptyResources" />}
      </div>
    </div>
  );
}
