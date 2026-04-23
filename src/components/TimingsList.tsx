"use client";

import { useTranslate } from "@/hooks/useTranslate";

export interface TimingListItem {
  _id: string;
  title: string;
  description?: string;
  schedule: string;
}

function TimingCard({ item }: { item: TimingListItem }) {
  const [title, description, schedule] = useTranslate([
    item.title,
    item.description ?? null,
    item.schedule,
  ]);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl sm:text-[26px] lg:text-[28px] font-semibold text-stone-800 whitespace-pre-wrap">{title}</h2>
      {description && <p className="mt-2 text-base text-stone-600 whitespace-pre-wrap">{description}</p>}
      <p className="mt-3 text-base font-medium text-accent whitespace-pre-wrap">{schedule}</p>
    </div>
  );
}

export default function TimingsList({ timings }: { timings: TimingListItem[] }) {
  return (
    <div className="mt-8 space-y-6">
      {timings.map((item) => (
        <TimingCard key={item._id} item={item} />
      ))}
    </div>
  );
}
