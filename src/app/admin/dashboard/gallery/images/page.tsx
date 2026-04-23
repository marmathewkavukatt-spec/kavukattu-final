"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";

interface Category {
  _id: string;
  title: string;
  coverImage: string;
  active: boolean;
}

export default function ImagesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    const res = await fetch("/api/gallery/categories");
    if (res.ok) {
      setCategories(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

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

  if (categories.length === 0) {
    return (
      <div className="pb-8">
        <BackButton />
        <h1 className="mt-4 font-serif text-3xl font-bold text-stone-800">Manage Images</h1>
        <div className="mt-8 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-4 text-sm font-medium text-stone-600">
            No categories found. Please create a category first.
          </p>
          <Link
            href="/admin/dashboard/gallery/categories/add"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Category
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <BackButton />
      <h1 className="mt-4 font-serif text-3xl font-bold text-stone-800">Manage Images</h1>
      <p className="mt-2 text-stone-600">Select a category to manage its images.</p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/admin/dashboard/gallery/images/${category._id}`}
            className="group relative overflow-hidden rounded-xl border-2 border-stone-200 bg-white shadow-sm transition-all hover:border-accent hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
              <img
                src={category.coverImage}
                alt={category.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg font-semibold text-stone-800 group-hover:text-accent transition-colors">
                {category.title}
              </h3>
              {!category.active && (
                <span className="mt-2 inline-block rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
                  Inactive
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
