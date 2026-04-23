"use client";

import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { useTranslate } from "@/hooks/useTranslate";

export default function TestTranslationPage() {
  const { lang, setLang } = useLang();
  const [testTexts, setTestTexts] = useState([
    "Welcome to our church",
    "Gallery",
    "Announcements",
    "Resources",
  ]);

  const translated = useTranslate(testTexts);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Translation Test Page</h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setLang("en")}
          className={`px-4 py-2 rounded ${
            lang === "en" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLang("ml")}
          className={`px-4 py-2 rounded ${
            lang === "ml" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          മലയാളം
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Current Language: <strong>{lang}</strong></p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Original Text</h2>
          {testTexts.map((text, index) => (
            <div key={index} className="p-3 mb-2 bg-gray-100 rounded">
              {text}
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Translated Text</h2>
          {translated.map((text, index) => (
            <div key={index} className="p-3 mb-2 bg-green-100 rounded">
              {text || "Loading..."}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click the language buttons above to switch languages</li>
          <li>Watch the "Translated Text" column update automatically</li>
          <li>If switching to Malayalam, text should translate to Malayalam</li>
          <li>If switching to English, text should remain in English</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">Testing Admin Content:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Go to any admin section (Gallery, Announcements, etc.)</li>
          <li>Add content in English</li>
          <li>View it on the frontend</li>
          <li>Switch language to മലയാളം</li>
          <li>Content should automatically translate</li>
        </ol>
      </div>
    </div>
  );
}
