"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import Image from "next/image";
import { uploadAdminFileWithProgress } from "@/lib/admin-upload-client";

interface Category {
  _id: string;
  title: string;
  coverImage: string;
}

interface GalleryItem {
  _id: string;
  image: string;
  title: string | null;
  order: number;
}

type UploadRow = {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "queued" | "uploading" | "saving" | "done" | "error";
  message?: string;
};

function makeClientId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromFilename(name: string) {
  const base = name.replace(/\.[^/.]+$/, "");
  return base.replace(/[_-]+/g, " ").trim();
}

function toBrowserSafeSrc(src: string) {
  if (!src) return src;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  return encodeURI(src);
}

export default function ManageCategoryImagesPage({ params }: { params: { id: string } }) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    order: 0,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([]);
  const [useFilenameTitles, setUseFilenameTitles] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{ deleted: number; total: number } | null>(null);

  useEffect(() => {
    setCategoryId(params.id);
    loadCategoryData(params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCategoryData(id: string) {
    setLoading(true);
    const res = await fetch(`/api/gallery/categories/${id}`);
    if (res.ok) {
      const data = await res.json();
      setCategory(data.category);
      setItems(data.items);
    }
    setLoading(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles(files);
    setUploadRows(
      files.map((file) => ({
        id: makeClientId(),
        file,
        progress: 0,
        status: "queued",
      })),
    );

    if (files.length === 1) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      setImagePreview("");
    }
  }

  async function uploadImageWithProgress(file: File, rowId: string): Promise<string> {
    const uploaded = await uploadAdminFileWithProgress(
      file,
      { storage: "local" },
      (progress) => {
        setUploadRows((current) =>
          current.map((row) => (row.id === rowId ? { ...row, progress: progress.percent } : row)),
        );
      },
    );
    return uploaded.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingItem) {
        let imageUrl = formData.image;

        if (selectedFiles.length === 1 && uploadRows[0]) {
          const rowId = uploadRows[0].id;
          setUploadRows((rows) => rows.map((r) => (r.id === rowId ? { ...r, status: "uploading" } : r)));
          imageUrl = await uploadImageWithProgress(selectedFiles[0], rowId);
        }

        const payload = {
          categoryId,
          image: imageUrl,
          title: formData.title || null,
          order: formData.order,
        };

        setUploadRows((rows) => rows.map((r) => ({ ...r, status: "saving", progress: Math.max(90, r.progress) })));

        const res = await fetch(`/api/gallery/items/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");

        setUploadRows((rows) => rows.map((r) => ({ ...r, status: "done", progress: 100 })));
        resetForm();
        loadCategoryData(categoryId);
        return;
      }

      if (selectedFiles.length === 0) {
        alert("Please choose at least one image.");
        return;
      }

      const startOrder = Math.max(0, formData.order || 0);
      let hadErrors = false;

      for (let i = 0; i < selectedFiles.length; i += 1) {
        const file = selectedFiles[i];
        const row = uploadRows[i];
        if (!row) continue;

        try {
          setUploadRows((rows) =>
            rows.map((r) => (r.id === row.id ? { ...r, status: "uploading", message: undefined } : r)),
          );
          const imageUrl = await uploadImageWithProgress(file, row.id);

          setUploadRows((rows) =>
            rows.map((r) => (r.id === row.id ? { ...r, status: "saving", progress: 100 } : r)),
          );

          const isBulk = selectedFiles.length > 1;
          const title = isBulk
            ? useFilenameTitles
              ? titleFromFilename(file.name) || null
              : null
            : formData.title || null;

          const payload = {
            categoryId,
            image: imageUrl,
            title,
            order: startOrder + i,
          };

          const res = await fetch("/api/gallery/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Failed to create");

          setUploadRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, status: "done" } : r)));
        } catch (error) {
          hadErrors = true;
          const message = error instanceof Error ? error.message : "Upload failed.";
          setUploadRows((rows) =>
            rows.map((r) => (r.id === row.id ? { ...r, status: "error", message } : r)),
          );
        }
      }

      await loadCategoryData(categoryId);

      if (!hadErrors) {
        resetForm();
      } else {
        alert("Some images failed to upload. Please review the errors and try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save image");
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setFormData({ image: "", title: "", order: 0 });
    setImagePreview("");
    setSelectedFiles([]);
    setUploadRows([]);
    setShowAddForm(false);
    setEditingItem(null);
  }

  function startEdit(item: GalleryItem) {
    setEditingItem(item);
    setFormData({
      image: item.image,
      title: item.title || "",
      order: item.order,
    });
    setImagePreview(item.image);
    setSelectedFiles([]);
    setUploadRows([]);
    setShowAddForm(true);
  }

  function openAddForm() {
    const nextOrder = items.length > 0 ? Math.max(...items.map((item) => item.order)) + 1 : 0;
    setEditingItem(null);
    setFormData({ image: "", title: "", order: nextOrder });
    setImagePreview("");
    setSelectedFiles([]);
    setUploadRows([]);
    setUseFilenameTitles(true);
    setShowAddForm(true);
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/gallery/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      loadCategoryData(categoryId);
    } catch (error) {
      console.error(error);
      alert("Failed to delete image");
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
      alert("No images selected.");
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} image${selectedIds.size === 1 ? '' : 's'}?`)) return;

    setBulkDeleting(true);
    setDeleteProgress({ deleted: 0, total: selectedIds.size });

    try {
      const response = await fetch("/api/gallery/items/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), categoryId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete images");
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
              const data = JSON.parse(line.slice(6));
              setDeleteProgress({ deleted: data.deleted, total: data.total });
            }
          }
        }
      }

      setSelectedIds(new Set());
      loadCategoryData(categoryId);
    } catch (error) {
      console.error(error);
      alert("Failed to delete some images.");
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
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pb-8">
        <BackButton />
        <div className="mt-8 text-center">
          <p className="text-stone-600">Category not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">{category.title}</h1>
          <p className="mt-2 text-base text-stone-600">Manage images in this category</p>
        </div>
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
          {!showAddForm && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Image
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="mt-6 rounded-xl border-2 border-stone-200 bg-white p-6">
          <h2 className="font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-semibold text-stone-800">
            {editingItem ? "Edit Image" : "Add New Image"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Image</label>
              {!editingItem && (
                <p className="mt-1 text-xs text-stone-500">
                  Tip: You can select multiple images for bulk upload.
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple={!editingItem}
                disabled={uploading}
                className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:opacity-60"
              />
              {imagePreview && (
                <div className="mt-2 relative h-48 w-full overflow-hidden rounded-lg bg-stone-100">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}

              {uploadRows.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadRows.map((row) => (
                    <div key={row.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-800">{row.file.name}</p>
                          <p className="text-xs text-stone-500">
                            {row.status === "queued" && "Ready"}
                            {row.status === "uploading" && `Uploading... ${row.progress}%`}
                            {row.status === "saving" && "Saving..."}
                            {row.status === "done" && "Done"}
                            {row.status === "error" && (row.message || "Failed")}
                          </p>
                        </div>
                        <span
                          className={[
                            "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                            row.status === "done"
                              ? "bg-green-100 text-green-700"
                              : row.status === "error"
                                ? "bg-red-100 text-red-700"
                                : row.status === "uploading" || row.status === "saving"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-stone-200 text-stone-700",
                          ].join(" ")}
                        >
                          {row.status}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                        <div
                          className={[
                            "h-2 rounded-full transition-all duration-200",
                            row.status === "error"
                              ? "bg-red-500"
                              : row.status === "done"
                                ? "bg-green-600"
                                : "bg-accent",
                          ].join(" ")}
                          style={{ width: `${row.status === "queued" ? 0 : Math.min(100, row.progress)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!editingItem && selectedFiles.length > 1 ? (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <p className="text-sm font-semibold text-stone-800">Bulk upload options</p>
                <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={useFilenameTitles}
                    onChange={(e) => setUseFilenameTitles(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent"
                    disabled={uploading}
                  />
                  Use file name as title
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-stone-700">Title (Optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  placeholder="Image title or caption"
                  disabled={uploading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700">
                {!editingItem && selectedFiles.length > 1 ? "Start Order" : "Order"}
              </label>
              {!editingItem && selectedFiles.length > 1 && (
                <p className="mt-1 text-xs text-stone-500">Orders will increment automatically for each image.</p>
              )}
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                min="0"
                disabled={uploading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading || (!editingItem && selectedFiles.length === 0)}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50"
              >
                {uploading
                  ? selectedFiles.length > 1
                    ? "Uploading..."
                    : "Saving..."
                  : editingItem
                    ? "Update"
                    : selectedFiles.length > 1
                      ? "Upload"
                      : "Add"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {/* Bulk Delete Progress */}
        {bulkDeleting && deleteProgress && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Deleting images...
              </span>
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

        {/* Bulk Selection Controls */}
        {items.length > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
            <input
              type="checkbox"
              checked={selectedIds.size === items.length && items.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent cursor-pointer"
            />
            <span className="text-sm font-medium text-stone-700">
              {selectedIds.size === items.length && items.length > 0
                ? "Deselect All"
                : "Select All"}
            </span>
            {selectedIds.size > 0 && (
              <span className="ml-auto text-sm font-semibold text-accent">
                {selectedIds.size} selected
              </span>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-stone-600">
              No images in this category yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const isSelected = selectedIds.has(item._id);
              return (
                <div 
                  key={item._id} 
                  className={`group relative overflow-hidden rounded-xl border-2 bg-white shadow-sm ${
                    isSelected ? "border-accent ring-2 ring-accent ring-opacity-50" : "border-stone-200"
                  }`}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(item._id)}
                      className="h-5 w-5 rounded border-stone-300 text-accent focus:ring-accent cursor-pointer bg-white shadow-md"
                    />
                  </div>
                  <div className="relative aspect-square overflow-hidden bg-stone-200">
                    <Image
                      src={toBrowserSafeSrc(item.image)}
                      alt={item.title || "Gallery image"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    {item.title && (
                      <h3 className="font-serif font-medium text-stone-800">{item.title}</h3>
                    )}
                    <p className="text-sm text-stone-500">Order: {item.order}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex-1 rounded-lg border border-accent px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 rounded-lg border border-red-600 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
