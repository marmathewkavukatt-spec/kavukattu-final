import { notFound } from "next/navigation";
import GalleryCategoryNav from "@/components/GalleryCategoryNav";
import GalleryCategoryContent from "@/components/GalleryCategoryContent";
import { getPublicGalleryCategoryWithItems, getPublicGalleryCategories } from "@/lib/site-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { category } = await getPublicGalleryCategoryWithItems(id);
  if (!category) return { title: "Not Found" };
  return { title: `${category.title} - Gallery - Kavukattu` };
}

export default async function GalleryCategoryPage({ params }: Props) {
  const { id } = await params;
  const { category, items } = await getPublicGalleryCategoryWithItems(id);
  const categories = await getPublicGalleryCategories();
  
  if (!category) {
    notFound();
  }

  return (
    <>
      {/* Sticky category navigation */}
      <GalleryCategoryNav 
        categories={categories.map(cat => ({ _id: cat._id, title: cat.title }))} 
        currentCategoryId={id} 
      />

      <GalleryCategoryContent categoryTitle={category.title} items={items} />
    </>
  );
}
