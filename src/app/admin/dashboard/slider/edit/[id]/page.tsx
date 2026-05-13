"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";
import { uploadAdminFile } from "@/lib/admin-upload-client";

interface Slide {
  _id: string;
  image: string;
  title?: string;
  subtitle?: string;
  order: number;
  active: boolean;
}

export default function EditSliderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [form, setForm] = useState({ image: "", title: "", subtitle: "", order: 0, active: true });
  const [loading, setLoading] = useState(true);
  const [uploadedSessionFileUrl, setUploadedSessionFileUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadSlide() {
      try {
        const res = await fetch(`/api/slider/${id}`);
        if (res.ok) {
          const slide: Slide = await res.json();
          setForm({
            image: slide.image,
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            order: slide.order,
            active: slide.active,
          });
        } else {
          setMessage({ text: "Slide not found.", type: "error" });
        }
      } catch (error) {
        console.error("Failed to load slide:", error);
        setMessage({ text: "Failed to load slide.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadSlide();
  }, [id]);

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
    if (!form.image) {
      setMessage({ text: "Please upload an image before saving the slide.", type: "error" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/slider/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage({ text: "Slide updated successfully.", type: "success" });
        setTimeout(() => router.push("/admin/dashboard/slider/view"), 1500);
      } else {
        setMessage({ text: "Failed to update slide. Please try again.", type: "error" });
      }
    } catch (error) {
      console.error("Failed to save:", error);
      setMessage({ text: "Failed to save slide. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadAdminFile(file, { storage: "auto" }); // Use Cloudinary for slider

      if (uploadedSessionFileUrl && uploadedSessionFileUrl !== uploaded.url) {
        try {
          await deleteUploadedFile(uploadedSessionFileUrl);
        } catch {
          // Preserve the newly uploaded image even if temporary cleanup fails.
        }
      }

      setUploadedSessionFileUrl(uploaded.url);
      setForm((f) => ({ ...f, image: uploaded.url }));
    } catch (error) {
      const text = error instanceof Error ? error.message : "Image upload failed. Please try again.";
      setMessage({ text, type: "error" });
    } finally {
      setUploading(false);
      resetFileInput();
    }
  }

  async function handleRemoveUploadedFile() {
    if (!form.image) return;

    setUploading(true);
    setMessage(null);

    try {
      const shouldDeleteFromServer = uploadedSessionFileUrl && form.image === uploadedSessionFileUrl;

      if (shouldDeleteFromServer) {
        const response = await deleteUploadedFile(form.image);
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || "Failed to remove uploaded image. Please try again.";
          setMessage({ text: errorMessage, type: "error" });
          return;
        }
      }

      setUploadedSessionFileUrl(null);
      setForm((current) => ({ ...current, image: "" }));
      resetFileInput();
      setMessage({
        text: shouldDeleteFromServer
          ? "Uploaded image removed."
          : "Image cleared from the form. Save to apply the change.",
        type: "success",
      });
    } catch {
      setMessage({ text: "Failed to remove uploaded image. Please try again.", type: "error" });
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
            <div className="h-4 w-40 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">Edit Slider</h1>
      <p className="mt-2 text-base text-stone-600">Update the slide details.</p>

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
          <label className="block text-sm font-semibold text-stone-700">Upload Image *</label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {uploading && <p className="text-sm font-medium text-blue-600">Uploading...</p>}
          {form.image && (
            <div className="mt-3 flex items-start gap-4">
              <img src={form.image} alt="Preview" className="h-32 w-48 rounded-xl object-cover shadow-md" />
              <button
                type="button"
                onClick={handleRemoveUploadedFile}
                disabled={uploading}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Title</label>
          <textarea
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
            placeholder="Enter slide title (optional, press Enter for new line)"
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Subtitle</label>
          <textarea
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300 resize-none"
            placeholder="Enter slide subtitle (optional, press Enter for new line)"
            rows={2}
          />
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
        
        <label className="flex items-center gap-3 rounded-lg bg-stone-50 p-4">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="h-5 w-5 rounded border-2 border-stone-300 text-accent transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2"
          />
          <span className="text-sm font-medium text-stone-700">Active (show on site)</span>
        </label>
        
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
          >
            {saving ? "Saving…" : "Update Slide"}
          </button>
          <button 
            type="button" 
            onClick={() => router.push("/admin/dashboard/slider/view")} 
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-6 py-3 font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
