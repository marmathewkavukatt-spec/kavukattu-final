"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import AdminMessage from "@/components/AdminMessage";
import { uploadAdminFile } from "@/lib/admin-upload-client";

const TITLE_MAX_LENGTH = 180;
const SUBTITLE_MAX_LENGTH = 300;
const DESCRIPTION_MAX_LENGTH = 5000;

const CATEGORY_OPTIONS = [
  { value: "PASTORAL_LETTERS", label: "Pastoral letters" },
  { value: "CIRCULARS", label: "Circulars" },
  { value: "OTHERS", label: "Others" },
] as const;

type ArchiveCategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];

interface ArchiveDocument {
  _id: string;
  category: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
}

export default function EditArchiveDocumentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [docId, setDocId] = useState("");
  const [form, setForm] = useState<{
    category: ArchiveCategoryValue;
    title: string;
    subtitle: string;
    description: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>({
    category: CATEGORY_OPTIONS[0].value,
    title: "",
    subtitle: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileType: "",
    fileSize: 0,
  });
  const [uploadedSessionFileUrl, setUploadedSessionFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDocId(params.id);
    loadDoc(params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDoc(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/archives/${id}`);
      if (res.ok) {
        const data: ArchiveDocument = await res.json();
        setForm({
          category: (data.category as ArchiveCategoryValue) || CATEGORY_OPTIONS[0].value,
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          fileUrl: data.fileUrl || "",
          fileName: data.fileName || "",
          fileType: data.fileType || "",
          fileSize: data.fileSize || 0,
        });
      } else {
        setMessage({ text: "Document not found.", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to load document.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteUploadedFile(url: string) {
    return fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" });
  }

  function resetFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.category) {
      setMessage({ text: "Please choose a category.", type: "error" });
      return;
    }

    if (!form.fileUrl) {
      setMessage({ text: "File is required. Please upload a file.", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const body = {
        category: form.category,
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        fileUrl: form.fileUrl,
        fileName: form.fileName || undefined,
        fileType: form.fileType || undefined,
        fileSize: form.fileSize || undefined,
      };

      const response = await fetch(`/api/archives/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({ text: data.error || "Update failed. Please try again.", type: "error" });
        return;
      }

      setMessage({ text: "Document updated successfully.", type: "success" });
      setUploadedSessionFileUrl(null);

      setTimeout(() => {
        router.push("/admin/dashboard/archives/view");
      }, 1200);
    } catch {
      setMessage({ text: "Update failed. Please check your connection and try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const uploaded = await uploadAdminFile(file, { storage: "local" });

      if (uploadedSessionFileUrl && uploadedSessionFileUrl !== uploaded.url) {
        try {
          await deleteUploadedFile(uploadedSessionFileUrl);
        } catch {
          // keep the new upload
        }
      }

      setUploadedSessionFileUrl(uploaded.url);
      setForm((f) => ({
        ...f,
        fileUrl: uploaded.url,
        fileName: file.name || "",
        fileType: file.type || "",
        fileSize: file.size || 0,
      }));
    } catch (error) {
      const text = error instanceof Error ? error.message : "File upload failed. Please try again.";
      setMessage({ text, type: "error" });
    } finally {
      setUploading(false);
      resetFileInput();
    }
  }

  async function handleRemoveNewUpload() {
    if (!uploadedSessionFileUrl) return;
    setUploading(true);
    try {
      await deleteUploadedFile(uploadedSessionFileUrl);
      setUploadedSessionFileUrl(null);
      setForm((f) => ({ ...f, fileUrl: "", fileName: "", fileType: "", fileSize: 0 }));
      setMessage({ text: "Newly uploaded file removed. Please upload a file before saving.", type: "success" });
    } catch {
      setMessage({ text: "Failed to remove uploaded file.", type: "error" });
    } finally {
      setUploading(false);
      resetFileInput();
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
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">
        Edit Archive / Document
      </h1>

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
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ArchiveCategoryValue }))}
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            maxLength={TITLE_MAX_LENGTH}
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Optional"
          />
          <p className="text-xs text-stone-500">
            {form.title.length}/{TITLE_MAX_LENGTH}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Subtitle</label>
          <input
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            maxLength={SUBTITLE_MAX_LENGTH}
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Optional"
          />
          <p className="text-xs text-stone-500">
            {form.subtitle.length}/{SUBTITLE_MAX_LENGTH}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={8}
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 hover:border-stone-300"
            placeholder="Optional"
          />
          <p className="text-xs text-stone-500">
            {form.description.length}/{DESCRIPTION_MAX_LENGTH}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Replace File *</label>
          <p className="text-xs text-stone-500">
            Supported: images, PDF, Word, Excel, PowerPoint, RTF, and text files.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploading && <p className="text-sm font-medium text-blue-600">Uploading...</p>}

          {form.fileUrl && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Current file: {form.fileName || form.fileUrl.split("/").pop()}</span>
              <Link
                href={form.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs font-semibold text-green-800 underline"
              >
                Open
              </Link>
              {uploadedSessionFileUrl && form.fileUrl === uploadedSessionFileUrl && (
                <button
                  type="button"
                  onClick={handleRemoveNewUpload}
                  disabled={uploading}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove new upload
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link
            href="/admin/dashboard/archives/view"
            className="w-full rounded-xl border-2 border-stone-200 bg-white px-6 py-3 text-center font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
