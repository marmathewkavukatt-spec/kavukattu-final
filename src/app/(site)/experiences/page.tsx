import PaginatedTestimonies from "@/components/PaginatedTestimonies";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import { getPublicTestimonies } from "@/lib/site-data";

export const metadata = {
  title: "Kavukattu",
  description: "Experiences from our community",
};

export const revalidate = 180;

export default async function ExperiencesPage() {
  const testimonies = await getPublicTestimonies();
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
        {testimonies.length ? (
          <PaginatedTestimonies items={testimonies} />
        ) : (
          <EmptyState textKey="emptyTestimonies" />
        )}
      </div>
    </div>
  );
}

