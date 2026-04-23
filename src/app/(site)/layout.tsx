import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LangProvider } from "@/context/LangContext";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LangProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LangProvider>
  );
}
