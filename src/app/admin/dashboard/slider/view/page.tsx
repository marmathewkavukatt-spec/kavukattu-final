"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";

interface Slide {
  _id: string;
  image: string;
  title?: string;
  subtitle?: string;
  order: number;
  active: boolean;
}

export default function ViewSlidersPage() {
  const router = useRouter();
  const [items, setItems] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/slider/all", { cache: 'no-store' });
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error("Failed to load slides:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this slide?")) return;
    try {
      await fetch(`/api/slider/${id}`, { method: "DELETE" });
      setItems(items.filter(item => item._id !== id));
      setMessage({ text: "Slide deleted.", type: "success" });
    } catch (error) {
      console.error("Failed to delete:", error);
      setMessage({ text: "Failed to delete slide. Please try again.", type: "error" });
    }
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
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item._id)));
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) {
      setMessage({ text: "Please select slides to delete.", type: "error" });
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} selected slide(s)?`)) return;

    setBulkDeleting(true);
    setDeleteProgress({ current: 0, total: selectedIds.size });
    
    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < idsToDelete.length; i++) {
      try {
        await fetch(`/api/slider/${idsToDelete[i]}`, { method: "DELETE" });
        successCount++;
      } catch (error) {
        console.error(`Failed to delete ${idsToDelete[i]}:`, error);
        failCount++;
      }
      setDeleteProgress({ current: i + 1, total: idsToDelete.length });
    }

    // Reload the list
    await load();
    setSelectedIds(new Set());
    setBulkDeleting(false);
    setDeleteProgress({ current: 0, total: 0 });

    if (failCount === 0) {
      setMessage({ text: `Successfully deleted ${successCount} slide(s).`, type: "success" });
    } else {
      setMessage({ 
        text: `Deleted ${successCount} slide(s). Failed to delete ${failCount} slide(s).`, 
        type: "error" 
      });
    }
  }

  if (loading) {
    return (
      <div className="pb-8">
        <BackButton />
        <div className="mt-4 space-y-4">
          <div className="h-7 w-40 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-stone-200 animate-pulse" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 w-full rounded-xl bg-stone-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = deleteProgress.total > 0 
    ? (deleteProgress.current / deleteProgress.total) * 100 
    : 0;

  return (
    <div className="pb-8">
      <BackButton />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">View Sliders</h1>
          <p className="mt-2 text-base text-stone-600">Manage all slides displayed on the home page.</p>
        </div>
        <button
          onClick={() => router.push("/admin/dashboard/slider/add")}
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg"
        >
          Add New Slide
        </button>
      </div>

      {message && (
        <div className="mt-4">
          <AdminMessage
            open={!!message}
            variant={message.type}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </AdminMessage>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {items.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.size === items.length && items.length > 0}
              onChange={toggleSelectAll}
              className="h-5 w-5 rounded border-2 border-stone-300 text-accent transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2"
            />
            <span className="text-sm font-medium text-stone-700">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select All"}
            </span>
          </label>
          
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.size})`}
            </button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {bulkDeleting && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-blue-900">
            <span>Deleting slides...</span>
            <span>{deleteProgress.current} / {deleteProgress.total}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-blue-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="mt-6">
        {items.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm">
            <p className="text-stone-500">No slides found. Add your first slide to get started.</p>
            <button
              onClick={() => router.push("/admin/dashboard/slider/add")}
              className="mt-4 rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90"
            >
              Add Slide
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((s) => (
              <li key={s._id} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s._id)}
                      onChange={() => toggleSelection(s._id)}
                      className="mt-1 h-5 w-5 rounded border-2 border-stone-300 text-accent transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    />
                    <img src={s.image} alt="" className="h-20 w-32 rounded-lg object-cover ring-2 ring-stone-200" />
                  </label>
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-stone-900">{s.title || "No title"}</h3>
                    <p className="mt-1 text-sm text-stone-600">{s.subtitle || "No subtitle"}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs text-stone-400">Order: {s.order}</span>
                      {s.active && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/dashboard/slider/edit/${s._id}`)}
                      className="w-full rounded-lg border-2 border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-accent hover:bg-accent hover:text-white sm:w-auto"
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDelete(s._id)} 
                      className="w-full rounded-lg border-2 border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
