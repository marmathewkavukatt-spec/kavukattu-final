import { notFound } from "next/navigation";
import { getPublicArchiveDocumentById } from "@/lib/site-data";
import ArchiveDocumentDetail from "@/components/ArchiveDocumentDetail";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const doc = await getPublicArchiveDocumentById(params.id);

  if (!doc) {
    return { title: "Archives / Documents Not Found - Kavukattu" };
  }

  const title =
    typeof doc.title === "string" && doc.title.trim()
      ? doc.title.trim()
      : doc.fileName?.trim() || "Archives / Documents";

  const description =
    typeof doc.description === "string" && doc.description.trim()
      ? doc.description.trim().slice(0, 150)
      : "Archives / Documents - Kavukattu";

  return { title: `${title} - Kavukattu`, description };
}

export default async function ArchiveDocumentPage({ params }: { params: { id: string } }) {
  const doc = await getPublicArchiveDocumentById(params.id);

  if (!doc) {
    notFound();
  }

  return <ArchiveDocumentDetail doc={doc} />;
}

