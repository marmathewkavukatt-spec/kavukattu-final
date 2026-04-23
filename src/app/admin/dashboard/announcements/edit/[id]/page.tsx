"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";
import { uploadAdminFile } from "@/lib/admin-upload-client";

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

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    title: "", 
    subtitle: "",
    description: "",
    content: "", 
    category: "upcoming-events",
    coverImage: "",
    fileUrl: "", 
    date: new Date().toISOString().slice(0, 10), 
    active: true 
  });
  const [uploadedSessionFileUrl, setUploadedSessionFileUrl] = useState<string | null>(null);
  const [uploadedSessionCoverImage, setUploadedSessionCoverImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadAnnouncement(id);
  }, [id]);

  async function loadAnnouncement(announcementId: string) {
    try {
      const res = await fetch("/api/announcements/all");
      if (res.ok) {
        const items: Announcement[] = await res.json();
        const announcement = items.find(item => item._id === announcementId);
        if (announcement) {
          setForm({
            title: announcement.title,
            subtitle: announcement.subtitle || "",
            description: announcement.description || "",
            content: announcement.content,
            category: announcement.category,
            coverImage: announcement.coverImage || "",
            fileUrl: announcement.fileUrl || "",
            date: new Date(announcement.date).toISOString().slice(0, 10),
            active: announcement.active,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load announcement:", error);
      setMessage({ text: "Failed to load announcement.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Custom validation: only cover image is required
    if (!form.coverImage) {
      setMessage({ text: "Please upload a cover image.", type: "error" });
      return;
    }
    
    setSaving(true);
    setMessage(null);
    try {
      const body = { 
        ...form, 
        date: new Date(form.date), 
        coverImage: form.coverImage || undefined,
        fileUrl: form.fileUrl || undefined,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        title: form.title || "Untitled",
        content: form.content || "",
      };
      
      const response = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({ text: data.error || "Update failed. Please try again.", type: "error" });
        return;
      }

      setMessage({ text: "Announcement updated successfully!", type: "success" });
      
      // Redirect to view page after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/dashboard/announcements/view");
      }, 1500);
    } catch {
      setMessage({ text: "Update failed. Please check your connection and try again.", type: "error" });
    } finally {
      setSaving(false);
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

  function resetCoverImageInput() {
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  }

  async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const uploaded = await uploadAdminFile(file, { storage: "local" });

      if (uploadedSessionCoverImage && uploadedSessionCoverImage !== uploaded.url) {
        try {
          await deleteUploadedFile(uploadedSessionCoverImage);
        } catch {
          // Keep the new upload even if cleanup fails
        }
      }

      setUploadedSessionCoverImage(uploaded.url);
      setForm((f) => ({ ...f, coverImage: uploaded.url }));
    } catch (error) {
      const text = error instanceof Error ? error.message : "Cover image upload failed. Please try again.";
      setMessage({ text, type: "error" });
    } finally {
      setUploadingCover(false);
      resetCoverImageInput();
    }
  }

  async function handleRemoveCoverImage() {
    if (!form.coverImage) return;

    setUploadingCover(true);
    setMessage(null);

    try {
      const shouldDeleteFromServer = uploadedSessionCoverImage && form.coverImage === uploadedSessionCoverImage;

      if (shouldDeleteFromServer) {
        const response = await deleteUploadedFile(form.coverImage);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setMessage({ text: data.error || "Failed to remove cover image.", type: "error" });
          return;
        }
      }

      setUploadedSessionCoverImage(null);
      setForm((current) => ({ ...current, coverImage: "" }));
      resetCoverImageInput();
      setMessage({
        text: shouldDeleteFromServer
          ? "Cover image removed."
          : "Cover image cleared from the form. Save to apply the change.",
        type: "success",
      });
    } catch {
      setMessage({ text: "Failed to remove cover image. Please try again.", type: "error" });
    } finally {
      setUploadingCover(false);
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
      setForm((f) => ({ ...f, fileUrl: uploaded.url }));
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
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">Edit Announcement</h1>
      
      {message && (
        <div className="mt-4">
          <AdminMessage open={!!message} variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </AdminMessage>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Cover Image *</label>
          <p className="text-xs text-stone-500">Upload an image for the announcement card (recommended: 800x600px or 4:3 ratio)</p>
          <div className="relative">
            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              disabled={uploadingCover}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {uploadingCover && <p className="text-sm font-medium text-blue-600">Uploading cover image...</p>}
          {form.coverImage && (
            <div className="mt-3 space-y-2">
              <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg border-2 border-stone-200">
                <img src={form.coverImage} alt="Cover preview" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={form.coverImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-accent underline"
                >
                  View Full Size
                </Link>
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  disabled={uploadingCover}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Title</label>
          <textarea 
            value={form.title} 
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
            placeholder="Enter announcement title (optional, press Enter for new line)"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Subtitle</label>
          <input 
            type="text"
            value={form.subtitle} 
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Enter subtitle (optional)"
            maxLength={300}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Description</label>
          <textarea 
            value={form.description} 
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
            rows={3} 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Enter description (optional)"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Content</label>
          <textarea 
            value={form.content} 
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} 
            rows={5} 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Enter announcement content (optional)"
          />
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
          <label className="block text-sm font-semibold text-stone-700">Date</label>
          <input 
            type="date" 
            value={form.date} 
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} 
            className="rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
          />
        </div>
        
        <label className="flex items-center gap-3 rounded-lg bg-stone-50 p-4">
          <input 
            type="checkbox" 
            checked={form.active} 
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} 
            className="h-5 w-5 rounded border-2 border-stone-300 text-accent transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2"
          />
          <span className="text-sm font-medium text-stone-700">Active</span>
        </label>
        
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
          >
            {saving ? "Updating…" : "Update Announcement"}
          </button>
          <Link
            href="/admin/dashboard/announcements/view"
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-6 py-3 text-center font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
