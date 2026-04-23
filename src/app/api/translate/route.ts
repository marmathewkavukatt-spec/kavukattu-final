import { NextRequest, NextResponse } from "next/server";

/**
 * Translation API - Disabled
 * 
 * This endpoint is disabled. All translations should be:
 * 1. Static content: Added to src/lib/translations.ts
 * 2. Admin content: Added by admin in Malayalam when creating content
 * 
 * This endpoint now just returns the original text without translation.
 */

export async function POST(req: NextRequest) {
  try {
    const { texts } = (await req.json()) as { texts: unknown };

    if (!Array.isArray(texts)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const safeTexts = texts.map((t) => (typeof t === "string" ? t : ""));

    // Return original texts without translation
    // Admin-controlled content should be added in Malayalam by the admin
    return NextResponse.json({ translations: safeTexts });
  } catch (err) {
    console.error("[translate]", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}

