import AboutContent from "@/components/AboutContent";
import { generatePageMetadata, seoConfig } from "@/lib/seo-config";

export const metadata = generatePageMetadata({
  title: "History - Life and Legacy of Mar Mathew Kavukatt",
  description: "Learn about the inspiring life and spiritual legacy of Mar Mathew Kavukatt (1904-1969), the first Archbishop of Changanacherry and Servant of God in the Catholic Church.",
  keywords: seoConfig.keywords.history,
  path: "/about",
  type: "article",
  image: "/uploads/ABOUT SECTION IMAGE.png"
});

export default function AboutPage() {
  return <AboutContent />;
}
