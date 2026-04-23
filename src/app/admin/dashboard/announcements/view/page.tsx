"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";

interface Announcement {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  content: string;
  category: string;
  coverImage?: string;
  fileUrl?: string;
  date: string;
  active: boolean;
}

const CATEGORIES = [
  { value: "upcoming-events", label: "Upcoming Events" },
  { value: "feast-days", label: "Feast Days" },
  { value: "special-prayers", label: "Special Prayers / Gatherings" },
];

export default function ViewAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{ deleted: number; total: number } | null>(null);

  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter(item => item.category === selectedCategory);

  async function load() {
    const res = await fetch("/api/announcements/all");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    setMessage({ text: "Announcement deleted.", type: "success" });
    load();
  }

  function toggleSelection(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(item => item._id)));
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) {
      setMessage({ text: "No announcements selected.", type: "error" });
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} announcement(s)?`)) return;

    setBulkDeleting(true);
    setDeleteProgress({ deleted: 0, total: selectedIds.size });

    try {
      const response = await fetch("/api/announcements/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!response.ok) throw new Error("Failed to delete announcements");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              setDeleteProgress({ deleted: data.deleted, total: data.total });
            }
          }
        }
      }

      setMessage({ text: `Successfully deleted ${selectedIds.size} announcement(s).`, type: "success" });
      setSelectedIds(new Set());
      load();
    } catch (error) {
      console.error(error);
      setMessage({ text: "Failed to delete some announcements.", type: "error" });
    } finally {
      setBulkDeleting(false);
      setDeleteProgress(null);
    }
  }

  if (loading) {
    return (
      <div className="pb-8">
        <BackButton />
        <div className="mt-4 space-y-4">
          <div className="h-7 w-44 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-stone-200 animate-pulse" />
          <div className="mt-4 space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-32 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">
          View Announcements
        </h1>
        <Link
          href="/admin/dashboard/announcements/add"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New
        </Link>
      </div>

      {message && (
        <div className="mt-4">
          <AdminMessage open={!!message} variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </AdminMessage>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-semibold text-stone-800">
            All Announcements
          </h2>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
              </button>
            )}
            <div className="text-sm text-stone-600">
              {filteredItems.length} {filteredItems.length === 1 ? "announcement" : "announcements"}
            </div>
          </div>
        </div>

        {/* Bulk Delete Progress */}
        {bulkDeleting && deleteProgress && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Deleting announcements...</span>
              <span className="text-sm font-semibold text-blue-900">
                {deleteProgress.deleted} / {deleteProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(deleteProgress.deleted / deleteProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setSelectedCategory("all"); setSelectedIds(new Set()); }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              selectedCategory === "all" ? "bg-accent text-white shadow-md" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            All ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter(item => item.category === cat.value).length;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => { setSelectedCategory(cat.value); setSelectedIds(new Set()); }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === cat.value ? "bg-accent text-white shadow-md" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Bulk Selection Controls */}
        {filteredItems.length > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent cursor-pointer"
            />
            <span className="text-sm font-medium text-stone-700">
              {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? "Deselect All" : "Select All"}
            </span>
            {selectedIds.size > 0 && (
              <span className="ml-auto text-sm font-semibold text-accent">
                {selectedIds.size} selected
              </span>
            )}
          </div>
        )}

        <ul className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((a) => {
              const categoryLabel = CATEGORIES.find(c => c.value === a.category)?.label || a.category;
              const isSelected = selectedIds.has(a._id);
              return (
                <li
                  key={a._id}
                  className={`rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                    isSelected ? "border-accent ring-2 ring-accent ring-opacity-50" : "border-stone-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(a._id)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                            {categoryLabel}
                          </span>
                          {a.coverImage && (
                            <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Has Image
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-semibold text-stone-900">{a.title}</h3>
                        {a.subtitle && <p className="mt-1 text-sm font-medium text-stone-700">{a.subtitle}</p>}
                        {a.description && <p className="mt-1 text-sm text-stone-600">{a.description}</p>}
                        <p className="mt-2 text-sm text-stone-600 line-clamp-2">{a.content}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-stone-500">{new Date(a.date).toLocaleDateString()}</span>
                          {a.active && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:ml-4 sm:w-auto sm:flex-row">
                      <Link
                        href={`/admin/dashboard/announcements/edit/${a._id}`}
                        className="w-full rounded-lg border-2 border-stone-200 bg-white px-4 py-2 text-center text-sm font-medium text-stone-700 transition-all hover:border-accent hover:bg-accent hover:text-white sm:w-auto"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(a._id)}
                        className="w-full rounded-lg border-2 border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-sm font-medium text-stone-600">
                {selectedCategory === "all"
                  ? "No announcements yet."
                  : `No announcements in ${CATEGORIES.find(c => c.value === selectedCategory)?.label || "this category"} yet.`}
              </p>
              <Link
                href="/admin/dashboard/announcements/add"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add First Announcement
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
