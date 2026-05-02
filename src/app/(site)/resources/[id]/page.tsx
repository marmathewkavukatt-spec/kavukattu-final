import { notFound } from "next/navigation";
import { getPublicResourceById } from "@/lib/site-data";
import ResourceDetail from "@/components/ResourceDetail";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const resource = await getPublicResourceById(params.id);

  if (!resource) {
    return { title: "Syriac Studies Not Found - Kavukattu" };
  }

  const description =
    typeof resource.description === "string" && resource.description.trim()
      ? resource.description.trim().slice(0, 150)
      : "Syriac Studies - Kavukattu";

  return { title: `${resource.title} - Kavukattu`, description };
}

export default async function ResourcePage({ params }: { params: { id: string } }) {
  const resource = await getPublicResourceById(params.id);

  if (!resource) {
    notFound();
  }

  return <ResourceDetail resource={resource} />;
}
