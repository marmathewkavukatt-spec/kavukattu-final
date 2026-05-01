import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LangProvider } from "@/context/LangContext";
import BackToHomeButton from "@/components/BackToHomeButton";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LangProvider>
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <BackToHomeButton />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </ErrorBoundary>
    </LangProvider>
  );
}
