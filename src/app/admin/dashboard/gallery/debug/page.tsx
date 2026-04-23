"use client";

import { useState, useEffect } from "react";

export default function GalleryDebugPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoryData, setCategoryData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/gallery/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  const loadCategory = async (id: string) => {
    setSelectedCategory(id);
    const res = await fetch(`/api/gallery/categories/${id}`);
    const data = await res.json();
    setCategoryData(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gallery Debug Tool</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Select Category:</h2>
        <select
          value={selectedCategory}
          onChange={(e) => loadCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">-- Select --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      {categoryData && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Category: {categoryData.category.title}</h2>
          
          <div className="space-y-6">
            {categoryData.items.map((item: any, index: number) => (
              <div key={item._id} className="border rounded p-4 bg-gray-50">
                <h3 className="font-bold mb-2">Item #{index + 1}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold">ID:</p>
                    <p className="text-xs font-mono">{item._id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Title:</p>
                    <p className="text-xs">{item.title || "(no title)"}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1">Image URL (from API):</p>
                  <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                    {item.image}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Length: {item.image.length} | 
                    Ends with: "{item.image.slice(-10)}" |
                    Last char code: {item.image.charCodeAt(item.image.length - 1)}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Test Image Load:</p>
                  <div className="border rounded p-2 bg-white">
                    <img
                      src={item.image}
                      alt="Test"
                      className="max-w-xs max-h-48 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.border = "2px solid red";
                        target.alt = `FAILED TO LOAD: ${item.image}`;
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.border = "2px solid green";
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Green border = loaded successfully, Red border = failed to load
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1">Direct Link Test:</p>
                  <a
                    href={item.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
