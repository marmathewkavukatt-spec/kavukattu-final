"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Youtube } from "lucide-react";

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
    }

    if (hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}?rel=0`;
      if (parts[0] === "shorts" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}?rel=0`;
    }

    return null;
  } catch {
    return null;
  }
}

const youtubeItems = [
  {
    label: "Channel",
    url: "https://youtu.be/PwhzdAe9Jbg",
  },
  {
    label: "Video 1",
    url: "https://youtu.be/p9J0unIRmzI?si=trnWyFq7qgqu8mVs",
  },
  {
    label: "Video 2",
    url: "https://youtu.be/hBiV6q7Pw1w?si=f6ToB9u0LBatc5__&sfnsn=wiwspwa",
  },
] as const;

export default function YoutubePageClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm ring-1 ring-stone-200">
            <Youtube className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 sm:text-4xl">YouTube</h1>
            <p className="mt-1 text-stone-600">Watch videos and visit our channel.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {youtubeItems.map((item) => {
            const embedUrl = getYouTubeEmbedUrl(item.url);

            return (
              <div key={item.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{item.label}</h2>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Open on YouTube
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <div className="aspect-video w-full">
                    {embedUrl ? (
                      <iframe
                        className="h-full w-full"
                        src={embedUrl}
                        title={item.label}
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold text-stone-600">
                        Preview unavailable for this link.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
