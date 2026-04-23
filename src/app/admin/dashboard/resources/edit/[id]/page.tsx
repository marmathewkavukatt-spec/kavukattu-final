"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function EditResourcePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [resourceId, setResourceId] = useState<string>("");
  const [form, setForm] = useState({ title: "", description: "", fileUrl: "", linkUrl: "", order: 0 });
  const [uploadedSessionFileUrl, setUploadedSessionFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setResourceId(params.id);
    loadResource(params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadResource(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources/${id}`);
      if (res.ok) {
        const data: Resource = await res.json();
        setForm({
          title: data.title,
          description: data.description || "",
          fileUrl: data.fileUrl || "",
          linkUrl: data.linkUrl || "",
          order: data.order,
        });
      } else {
        setMessage({ text: "Resource not found.", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to load resource.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

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
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({ text: data.error || "Resource update failed. Please try again.", type: "error" });
        return;
      }

      setMessage({ text: "Resource updated successfully.", type: "success" });
      setUploadedSessionFileUrl(null);
      
      // Redirect to view page after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/dashboard/resources/view");
      }, 1500);
    } catch {
      setMessage({ text: "Resource update failed. Please check your connection and try again.", type: "error" });
    } finally {
      setSaving(false);
    }
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
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setMessage({ text: data.error || "Failed to remove uploaded file.", type: "error" });
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
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">Edit Syriac Study</h1>

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
            {saving ? "Saving…" : "Update Resource"}
          </button>
          <Link
            href="/admin/dashboard/resources/view"
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-6 py-3 text-center font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
