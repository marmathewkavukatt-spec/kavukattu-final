"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";
import { uploadAdminFile } from "@/lib/admin-upload-client";

interface Category {
  _id: string;
  title: string;
  coverImage: string;
  order: number;
  active: boolean;
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", coverImage: "", order: 0, active: true });
  const [uploadedSessionCoverImage, setUploadedSessionCoverImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setId(params.id);
    loadCategory(params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCategory(categoryId: string) {
    try {
      const res = await fetch("/api/gallery/categories");
      if (res.ok) {
        const items: Category[] = await res.json();
        const category = items.find(item => item._id === categoryId);
        if (category) {
          setForm({
            title: category.title,
            coverImage: category.coverImage,
            order: category.order,
            active: category.active,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load category:", error);
      setMessage({ text: "Failed to load category.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/gallery/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || "Update failed. Please try again.";
        setMessage({ text: errorMessage, type: "error" });
        return;
      }

      const data = await response.json().catch(() => ({}));

      setMessage({ text: "Category updated successfully!", type: "success" });
      
      setTimeout(() => {
        router.push("/admin/dashboard/gallery/categories/view");
      }, 1500);
    } catch {
      setMessage({ text: "Update failed. Please check your connection and try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteUploadedFile(url: string) {
    return fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" });
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
        } catch {}
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
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || "Failed to remove cover image. Please try again.";
          setMessage({ text: errorMessage, type: "error" });
          return;
        }
      }

      setUploadedSessionCoverImage(null);
      setForm((current) => ({ ...current, coverImage: "" }));
      resetCoverImageInput();
      setMessage({ text: "Cover image removed. Save to apply the change.", type: "success" });
    } catch {
      setMessage({ text: "Failed to remove cover image. Please try again.", type: "error" });
    } finally {
      setUploadingCover(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-8">
        <BackButton />
        <div className="mt-4 space-y-4">
          <div className="h-7 w-44 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-stone-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">Edit Category</h1>
      
      {message && (
        <div className="mt-4">
          <AdminMessage open={!!message} variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </AdminMessage>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Category Title *</label>
          <input 
            type="text"
            value={form.title} 
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} 
            required 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Enter category title"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Cover Image *</label>
          <p className="text-xs text-stone-500">Upload a cover image for this category (recommended: 800x600px or 4:3 ratio)</p>
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
          <label className="block text-sm font-semibold text-stone-700">Order</label>
          <input 
            type="number" 
            value={form.order} 
            onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))} 
            className="w-32 rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
          />
          <p className="text-xs text-stone-500">Lower numbers appear first</p>
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
            {saving ? "Updating…" : "Update Category"}
          </button>
          <Link
            href="/admin/dashboard/gallery/categories/view"
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-6 py-3 text-center font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
