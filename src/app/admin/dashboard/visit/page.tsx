"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";

interface Timing {
  _id: string;
  title: string;
  description?: string;
  schedule: string;
  order: number;
}

interface VisitInfo {
  _id?: string;
  mapEmbedUrl?: string;
  address?: string;
  directions?: string;
  nearbyLandmarks?: string;
  travelGuidance?: string;
}

export default function TimingsManagePage() {
  const [items, setItems] = useState<Timing[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", schedule: "", order: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Visit Info state
  const [visitInfo, setVisitInfo] = useState<VisitInfo>({});
  const [savingVisitInfo, setSavingVisitInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<"timings" | "visit">("timings");

  async function load() {
    const res = await fetch("/api/timings");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  async function loadVisitInfo() {
    const res = await fetch("/api/visit-info");
    if (res.ok) {
      const data = await res.json();
      if (data) setVisitInfo(data);
    }
  }

  useEffect(() => {
    load();
    loadVisitInfo();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/timings/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        setEditingId(null);
      } else {
        await fetch("/api/timings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      setForm({ title: "", description: "", schedule: "", order: 0 });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/timings/${id}`, { method: "DELETE" });
    load();
  }

  async function handleVisitInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingVisitInfo(true);
    try {
      const res = await fetch("/api/visit-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitInfo),
      });
      if (res.ok) {
        alert("Visit information saved successfully!");
        loadVisitInfo();
      }
    } finally {
      setSavingVisitInfo(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-8">
        <BackButton />
        <div className="mt-4 space-y-4">
          <div className="h-7 w-40 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-stone-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">Visit Management</h1>
      
      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("timings")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "timings"
              ? "border-b-2 border-accent text-accent"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Service Timings
        </button>
        <button
          onClick={() => setActiveTab("visit")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "visit"
              ? "border-b-2 border-accent text-accent"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Visit Information
        </button>
      </div>

      {/* Timings Tab */}
      {activeTab === "timings" && (
        <>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
            <h2 className="font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-semibold text-stone-800">{editingId ? "Edit" : "Add"} Timing</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">Title *</label>
              <textarea 
                value={form.title} 
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} 
                required 
                rows={2}
                className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
                placeholder="e.g., Sunday Mass, Morning Prayer"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">Schedule *</label>
              <textarea 
                value={form.schedule} 
                onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} 
                required 
                rows={2}
                className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
                placeholder="e.g., Sunday 9:00 AM"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
                rows={3}
                className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
                placeholder="Additional details (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">Order</label>
              <input 
                type="number" 
                value={form.order} 
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} 
                className="w-32 rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
              />
            </div>
            
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
              >
                {saving ? "Saving…" : editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { 
                    setEditingId(null); 
                    setForm({ title: "", description: "", schedule: "", order: 0 }); 
                  }} 
                  className="w-full rounded-xl border-2 border-stone-200 bg-white px-6 py-3 font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 sm:w-auto"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          <div className="mt-8">
            <h2 className="mb-4 font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-semibold text-stone-800">All Timings</h2>
            <ul className="space-y-4">
              {items.map((t) => (
                <li key={t._id} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-stone-900 whitespace-pre-wrap">{t.title}</h3>
                      <p className="mt-1 text-sm font-medium text-accent whitespace-pre-wrap">{t.schedule}</p>
                      {t.description && (
                        <p className="mt-2 text-sm text-stone-600 whitespace-pre-wrap">{t.description}</p>
                      )}
                      <p className="mt-2 text-xs text-stone-400">Order: {t.order}</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:ml-4 sm:w-auto sm:flex-row">
                      <button 
                        type="button" 
                        onClick={() => { 
                          setForm({ title: t.title, description: t.description || "", schedule: t.schedule, order: t.order }); 
                          setEditingId(t._id); 
                        }} 
                        className="w-full rounded-lg border-2 border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-accent hover:bg-accent hover:text-white sm:w-auto"
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(t._id)} 
                        className="w-full rounded-lg border-2 border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Visit Information Tab */}
      {activeTab === "visit" && (
        <form onSubmit={handleVisitInfoSubmit} className="mt-8 space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
          <h2 className="font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-semibold text-stone-800">Visit Information</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Google Maps Embed URL</label>
            <input
              type="text"
              value={visitInfo.mapEmbedUrl || ""}
              onChange={(e) => setVisitInfo({ ...visitInfo, mapEmbedUrl: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-stone-500">Go to Google Maps → Share → Embed a map → Copy the src URL</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Address</label>
            <textarea
              value={visitInfo.address || ""}
              onChange={(e) => setVisitInfo({ ...visitInfo, address: e.target.value })}
              rows={3}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
              placeholder="Full address of the church"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Directions</label>
            <textarea
              value={visitInfo.directions || ""}
              onChange={(e) => setVisitInfo({ ...visitInfo, directions: e.target.value })}
              rows={6}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
              placeholder="Detailed directions on how to reach the church"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Nearby Landmarks</label>
            <textarea
              value={visitInfo.nearbyLandmarks || ""}
              onChange={(e) => setVisitInfo({ ...visitInfo, nearbyLandmarks: e.target.value })}
              rows={4}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
              placeholder="Notable landmarks near the church"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Travel Guidance</label>
            <textarea
              value={visitInfo.travelGuidance || ""}
              onChange={(e) => setVisitInfo({ ...visitInfo, travelGuidance: e.target.value })}
              rows={6}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
              placeholder="Transportation options, parking information, etc."
            />
          </div>

          <button
            type="submit"
            disabled={savingVisitInfo}
            className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
          >
            {savingVisitInfo ? "Saving…" : "Save Visit Information"}
          </button>
        </form>
      )}
    </div>
  );
}
