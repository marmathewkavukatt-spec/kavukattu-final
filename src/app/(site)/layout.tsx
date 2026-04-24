import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LangProvider } from "@/context/LangContext";
import BackToHomeButton from "@/components/BackToHomeButton";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LangProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <BackToHomeButton />
          {children}
        </main>
        <Footer />
      </div>
    </LangProvider>
  );
}
