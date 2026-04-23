"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";

type ArchiveCategory = "PASTORAL_LETTERS" | "CIRCULARS" | "OTHERS";

interface ArchiveDocument {
  _id: string;
  category: ArchiveCategory;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
}

const CATEGORY_TABS: Array<{ key: "ALL" | ArchiveCategory; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PASTORAL_LETTERS", label: "Pastoral letters" },
  { key: "CIRCULARS", label: "Circulars" },
  { key: "OTHERS", label: "Others" },
];

function formatCategory(category: ArchiveCategory) {
  if (category === "PASTORAL_LETTERS") return "Pastoral letters";
  if (category === "CIRCULARS") return "Circulars";
  return "Others";
}

function getDisplayTitle(item: ArchiveDocument) {
  return item.title?.trim() || item.fileName?.trim() || item.fileUrl.split("/").pop() || "Untitled";
}

export default function ViewArchivesPage() {
  const [items, setItems] = useState<ArchiveDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{ deleted: number; total: number } | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof CATEGORY_TABS)[number]["key"]>("ALL");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/archives");
    if (res.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTab === "ALL") return items;
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { ALL: items.length };
    for (const item of items) {
      next[item.category] = (next[item.category] ?? 0) + 1;
    }
    return next as Record<"ALL" | ArchiveCategory, number>;
  }, [items]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;

    const response = await fetch(`/api/archives/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage({ text: data.error || "Delete failed. Please try again.", type: "error" });
      return;
    }

    await load();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setMessage({ text: "Document deleted.", type: "success" });
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const ids = filteredItems.map((item) => item._id);
    if (ids.length === 0) return;

    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  const selectedCountInView = useMemo(() => {
    const ids = new Set(filteredItems.map((item) => item._id));
    let count = 0;
    selectedIds.forEach((id) => {
      if (ids.has(id)) count += 1;
    });
    return count;
  }, [filteredItems, selectedIds]);

  async function handleBulkDelete() {
    if (selectedIds.size === 0) {
      setMessage({ text: "No documents selected.", type: "error" });
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} document${selectedIds.size === 1 ? "" : "s"}?`)) return;

    setBulkDeleting(true);
    setDeleteProgress({ deleted: 0, total: selectedIds.size });
    setMessage(null);

    try {
      const response = await fetch("/api/archives/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete documents");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6)) as { deleted?: number; total?: number; error?: string };
              if (typeof data.deleted === "number" && typeof data.total === "number") {
                setDeleteProgress({ deleted: data.deleted, total: data.total });
              }
              if (data.error) {
                setMessage({ text: data.error, type: "error" });
              }
            }
          }
        }
      }

      setMessage({
        text: `Successfully deleted ${selectedIds.size} document${selectedIds.size === 1 ? "" : "s"}.`,
        type: "success",
      });
      setSelectedIds(new Set());
      await load();
    } catch (error) {
      console.error(error);
      setMessage({ text: "Failed to delete some documents.", type: "error" });
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
          <div className="h-7 w-56 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 w-72 rounded-full bg-stone-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">
            Archives / Documents
          </h1>
          <p className="mt-2 text-base text-stone-600">Manage pastoral letters, circulars, and other documents.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/admin/dashboard/archives/add"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-accent/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Document
          </Link>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-4">
          <AdminMessage open={!!message} variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </AdminMessage>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            {tab.label}{" "}
            <span className="ml-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {bulkDeleting && deleteProgress && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Deleting documents...</span>
            <span className="text-sm font-semibold text-blue-900">
              {deleteProgress.deleted} / {deleteProgress.total}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-blue-200">
            <div
              className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(deleteProgress.deleted / deleteProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {filteredItems.length > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
          <input
            type="checkbox"
            checked={filteredItems.length > 0 && selectedCountInView === filteredItems.length}
            onChange={toggleSelectAll}
            className="h-4 w-4 cursor-pointer rounded border-stone-300 text-accent focus:ring-accent"
          />
          <span className="text-sm font-medium text-stone-700">
            {filteredItems.length > 0 && selectedCountInView === filteredItems.length ? "Deselect All" : "Select All"}
          </span>
          {selectedIds.size > 0 && (
            <span className="ml-auto text-sm font-semibold text-accent">{selectedIds.size} selected (all tabs)</span>
          )}
        </div>
      )}

      <ul className="mt-4 space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((doc) => {
            const isSelected = selectedIds.has(doc._id);
            return (
              <li
                key={doc._id}
                className={`rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                  isSelected ? "border-accent ring-2 ring-accent ring-opacity-50" : "border-stone-200"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-1 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(doc._id)}
                      className="mt-1 h-4 w-4 cursor-pointer rounded border-stone-300 text-accent focus:ring-accent"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-semibold text-stone-900">{getDisplayTitle(doc)}</h3>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                          {formatCategory(doc.category)}
                        </span>
                      </div>
                      {doc.subtitle && <p className="mt-1 text-sm text-stone-600">{doc.subtitle}</p>}
                      {doc.description && <p className="mt-2 text-sm text-stone-600">{doc.description}</p>}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        {doc.fileType && <span>{doc.fileType}</span>}
                        <span>{new Date(doc.createdAt).toLocaleString()}</span>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-accent hover:underline"
                        >
                          Open file
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <Link
                      href={`/admin/dashboard/archives/edit/${doc._id}`}
                      className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc._id)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <li className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            No documents found in this category.
          </li>
        )}
      </ul>
    </div>
  );
}

