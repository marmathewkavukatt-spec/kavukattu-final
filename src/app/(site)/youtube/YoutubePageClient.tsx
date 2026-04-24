"use client";

import { ExternalLink, Youtube } from "lucide-react";

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

const youtubeVideos = [
  "https://youtu.be/PwhzdAe9Jbg",
  "https://youtu.be/p9J0unIRmzI?si=trnWyFq7qgqu8mVs",
  "https://youtu.be/hBiV6q7Pw1w?si=f6ToB9u0LBatc5__&sfnsn=wiwspwa",
] as const;

export default function YoutubePageClient() {
  return (
    <div className="bg-stone-50 py-10">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm ring-1 ring-stone-200">
            <Youtube className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 sm:text-4xl">YouTube</h1>
            <p className="mt-1 text-stone-600">Watch videos and visit our channel.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {youtubeVideos.map((url) => {
            const embedUrl = getYouTubeEmbedUrl(url);

            return (
              <div key={url} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <div className="aspect-video w-full">
                    {embedUrl ? (
                      <iframe
                        className="h-full w-full"
                        src={embedUrl}
                        title="YouTube video"
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

                <div className="mt-3 flex justify-end">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Open on YouTube
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
