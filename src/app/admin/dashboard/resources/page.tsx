"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";
import { uploadAdminFile } from "@/lib/admin-upload-client";

const DESCRIPTION_MAX_LENGTH = 5000;

interface Resource {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  linkUrl?: string;
  order: number;
}

export default function ResourcesManagePage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", fileUrl: "", linkUrl: "", order: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadedSessionFileUrl, setUploadedSessionFileUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    const res = await fetch("/api/resources");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteUploadedFile(url: string) {
    return fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
      method: "DELETE",
    });
  }

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body = { ...form, fileUrl: form.fileUrl || undefined, linkUrl: form.linkUrl || undefined };
      const endpoint = editingId ? `/api/resources/${editingId}` : "/api/resources";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || "Resource save failed. Please try again.";
        setMessage({ text: errorMessage, type: "error" });
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (editingId) {
        setEditingId(null);
        setMessage({ text: "Resource updated.", type: "success" });
      } else {
        setMessage({ text: "Resource added.", type: "success" });
      }
      setUploadedSessionFileUrl(null);
      setForm({ title: "", description: "", fileUrl: "", linkUrl: "", order: 0 });
      resetFileInput();
      await load();
    } catch {
      setMessage({ text: "Resource save failed. Please check your connection and try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    const response = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage = data.error || "Resource delete failed. Please try again.";
      setMessage({ text: errorMessage, type: "error" });
      return;
    }

    await load();
    setMessage({ text: "Resource deleted.", type: "success" });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadAdminFile(file, { storage: "local" });

      if (uploadedSessionFileUrl && uploadedSessionFileUrl !== uploaded.url) {
        try {
          await deleteUploadedFile(uploadedSessionFileUrl);
        } catch {
          // Keep the new upload even if cleanup of the previous temporary file fails.
        }
      }

      setUploadedSessionFileUrl(uploaded.url);
      setForm((f) => ({ ...f, fileUrl: uploaded.url, linkUrl: "" }));
    } catch (error) {
      const text = error instanceof Error ? error.message : "File upload failed. Please try again.";
      setMessage({ text, type: "error" });
    } finally {
      setUploading(false);
      resetFileInput();
    }
  }

  async function handleRemoveUploadedFile() {
    if (!form.fileUrl) return;

    setUploading(true);
    setMessage(null);

    try {
      const shouldDeleteFromServer = uploadedSessionFileUrl && form.fileUrl === uploadedSessionFileUrl;

      if (shouldDeleteFromServer) {
        const response = await deleteUploadedFile(form.fileUrl);
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || "Failed to remove uploaded file. Please try again.";
          setMessage({ text: errorMessage, type: "error" });
          return;
        }
      }

      setUploadedSessionFileUrl(null);
      setForm((current) => ({ ...current, fileUrl: "" }));
      resetFileInput();
      setMessage({
        text: shouldDeleteFromServer
          ? "Uploaded file removed."
          : "File cleared from the form. Save to apply the change.",
        type: "success",
      });
    } catch {
      setMessage({ text: "Failed to remove uploaded file. Please try again.", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-8">
        <BackButton />
        <div className="mt-4 space-y-4">
          <div className="h-7 w-40 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-stone-200 animate-pulse" />
          <div className="mt-4 space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-32 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-stone-200 animate-pulse" />
            <div className="h-4 w-48 rounded-full bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">Syriac Studies</h1>

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
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <h2 className="font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-semibold text-stone-800">{editingId ? "Edit" : "Add"}</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Title *</label>
          <textarea 
            value={form.title} 
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} 
            required 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
            placeholder="Enter resource title (press Enter for new line)"
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Description</label>
          <textarea 
            value={form.description} 
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={8} 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Brief description (optional)"
          />
          <p className="text-xs text-stone-500">
            {form.description.length}/{DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Upload File</label>
          <p className="text-xs text-stone-500">Supported: images, PDF, Word, Excel, PowerPoint, RTF, and text files.</p>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {uploading && <p className="text-sm font-medium text-blue-600">Uploading...</p>}
          {form.fileUrl && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">File uploaded: {form.fileUrl.split('/').pop()}</span>
              <Link
                href={form.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs font-semibold text-green-800 underline"
              >
                Open
              </Link>
              <button
                type="button"
                onClick={handleRemoveUploadedFile}
                disabled={uploading}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Order</label>
          <input 
            type="number" 
            value={form.order} 
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} 
            onFocus={(e) => {
              if (e.currentTarget.value === "0") e.currentTarget.select();
            }}
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
                setUploadedSessionFileUrl(null);
                setForm({ title: "", description: "", fileUrl: "", linkUrl: "", order: 0 }); 
                resetFileInput();
              }} 
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-6 py-3 font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 sm:w-auto"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className="mt-8">
        <h2 className="mb-4 font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-semibold text-stone-800">All Syriac Studies</h2>
        <ul className="space-y-4">
          {items.map((r) => (
            <li key={r._id} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-stone-900">{r.title}</h3>
                  {r.description && (
                    <p className="mt-1 text-sm text-stone-600">{r.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-stone-400">Order: {r.order}</span>
                    {r.fileUrl && (
                      <a 
                        href={r.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View File
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:ml-4 sm:w-auto sm:flex-row">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setUploadedSessionFileUrl(null);
                      setForm({ title: r.title, description: r.description || "", fileUrl: r.fileUrl || "", linkUrl: r.linkUrl || "", order: r.order }); 
                      setEditingId(r._id); 
                      resetFileInput();
                    }} 
                    className="w-full rounded-lg border-2 border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-accent hover:bg-accent hover:text-white sm:w-auto"
                  >
                    Edit
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDelete(r._id)} 
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
    </div>
  );
}
