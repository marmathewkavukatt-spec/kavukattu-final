"use client";

import PageHeading from "@/components/PageHeading";
import { useTranslate } from "@/hooks/useTranslate";

type OfficeHourItem = { days: string; time: string };
type ServiceItem = { name: string; time: string };
type LocationCard = { title: string; subtitle: string; address: string };

export default function VisitPageContent({
  mapEmbedUrl,
  mapOpenUrl,
  locationCard,
  officeHours,
  thursdayServices,
}: {
  mapEmbedUrl: string;
  mapOpenUrl: string;
  locationCard: LocationCard;
  officeHours: OfficeHourItem[];
  thursdayServices: ServiceItem[];
}) {
  const [
    pageSubtitleText,
    openInGoogleMapsText,
    officeHoursTitle,
    servicesAtTombTitle,
    thursdayText,
    museumLocationMapTitle,
  ] = useTranslate([
    "Office hours, services at the tomb, and the exact museum location on Google Maps.",
    "Open in Google Maps",
    "Office Hours",
    "Services At Tomb",
    "Thursday",
    "Museum Location Map",
  ]);

  const officeHourTexts = officeHours.flatMap((entry) => [entry.days, entry.time]);
  const officeHourTextsTranslated = useTranslate(officeHourTexts);
  const translatedOfficeHours = officeHours.map((entry, idx) => ({
    days: officeHourTextsTranslated[idx * 2] || entry.days,
    time: officeHourTextsTranslated[idx * 2 + 1] || entry.time,
  }));

  const serviceNamesTranslated = useTranslate(thursdayServices.map((service) => service.name));
  const translatedThursdayServices = thursdayServices.map((service, idx) => ({
    ...service,
    name: serviceNamesTranslated[idx] || service.name,
  }));

  return (
    <div className="bg-stone-50">
      {/* Colored Header Section */}
      <div className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeading textKey="pageTimings" className="text-white" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mt-3 max-w-2xl text-base md:text-lg leading-relaxed text-stone-600">
              {pageSubtitleText}
            </p>
          </div>
          <a
            href={mapOpenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {openInGoogleMapsText}
          </a>
        </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-lg lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-accent/10 p-3">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">{locationCard.title}</h2>
              <p className="mt-1 text-base font-medium text-stone-600">{locationCard.subtitle}</p>
              <p className="mt-4 whitespace-pre-line text-base md:text-lg leading-relaxed text-stone-700">
                {locationCard.address}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-stone-200 bg-white shadow-lg lg:col-span-3">
          <div className="aspect-[16/10] w-full bg-stone-100">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={museumLocationMapTitle}
            />
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/10 p-3">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">{officeHoursTitle}</h3>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {translatedOfficeHours.map((schedule) => (
              <div
                key={`${schedule.days}-${schedule.time}`}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition-colors hover:bg-stone-100"
              >
                <p className="text-base font-semibold text-stone-800">{schedule.days}</p>
                <p className="mt-2 text-base font-medium text-accent">{schedule.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/10 p-3">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h6m-2 8h4a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {servicesAtTombTitle} <span className="text-accent">[{thursdayText}]</span>
            </h3>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {translatedThursdayServices.map((service, index) => (
              <div
                key={`${service.name}-${service.time}`}
                className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-4 transition-colors hover:bg-stone-100"
              >
                <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-accent/5" />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-stone-900 leading-tight">{service.name}</p>
                    <p className="mt-1 text-base font-medium text-accent">{service.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

