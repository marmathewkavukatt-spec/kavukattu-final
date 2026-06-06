import PaginatedTestimonies from "@/components/PaginatedTestimonies";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import { getPublicFavoursRecieved } from "@/lib/site-data";

export const metadata = {
  title: "Favours Recieved | Kavukattu",
  description: "Favours Recieved from our community",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FavoursRecievedPage() {
  const favoursRecieved = await getPublicFavoursRecieved();
  return (
    <div className="bg-stone-50">
      {/* Colored Header Section */}
      <div className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeading textKey="pageTestimonies" className="text-white" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {favoursRecieved.length ? (
          <PaginatedTestimonies items={favoursRecieved} />
        ) : (
          <EmptyState textKey="emptyTestimonies" />
        )}
      </div>
    </div>
  );
}
