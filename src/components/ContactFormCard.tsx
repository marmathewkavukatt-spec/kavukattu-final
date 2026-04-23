"use client";

import { useRef, useState } from "react";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() ?? "";
const DEFAULT_SUBJECT = "Website Contact Form";

type SubmissionState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

function getFormattedTimestamp() {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

export default function ContactFormCard() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmissionState>(null);
  const isConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
  const { lang } = useLang();
  const tr = t[lang];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const honeypot = String(formData.get("website") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setStatus({ type: "error", message: tr.formErrorFields });
      return;
    }

    if (!isConfigured) {
      setStatus({ type: "error", message: tr.formErrorNotConfigured });
      return;
    }

    if (honeypot) {
      form.reset();
      setStatus({ type: "success", message: tr.formSuccess });
      return;
    }

    const submittedAtField = form.elements.namedItem("submitted_at");
    const titleField = form.elements.namedItem("title");

    if (submittedAtField instanceof HTMLInputElement) {
      submittedAtField.value = getFormattedTimestamp();
    }
    if (titleField instanceof HTMLInputElement && !titleField.value.trim()) {
      titleField.value = DEFAULT_SUBJECT;
    }

    setIsSubmitting(true);

    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, {
        publicKey: PUBLIC_KEY,
        blockHeadless: true,
        limitRate: { id: "public-contact-form", throttle: 10_000 },
      });
      form.reset();
      setStatus({ type: "success", message: tr.formSuccess });
    } catch (error) {
      console.error("EmailJS contact form error:", error);
      if (error && typeof error === "object" && "status" in error && error.status === 429) {
        setStatus({ type: "error", message: tr.formErrorThrottle });
        return;
      }
      setStatus({ type: "error", message: tr.formErrorGeneral });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-accent p-8 shadow-2xl lg:sticky lg:top-24">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="title" defaultValue={DEFAULT_SUBJECT} />
        <input type="hidden" name="submitted_at" defaultValue="" />
        <div className="hidden" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <div>
          <input type="text" name="name" required placeholder={tr.namePlaceholder}
            className="w-full border-b-2 border-white/30 bg-transparent px-0 py-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none" />
        </div>
        <div>
          <input type="email" name="email" required placeholder={tr.emailPlaceholder}
            className="w-full border-b-2 border-white/30 bg-transparent px-0 py-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none" />
        </div>
        <div>
          <input type="tel" name="phone" placeholder={tr.phonePlaceholder}
            className="w-full border-b-2 border-white/30 bg-transparent px-0 py-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none" />
        </div>
        <div>
          <textarea name="message" rows={5} required placeholder={tr.messagePlaceholder}
            className="w-full border-b-2 border-white/30 bg-transparent px-0 py-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none" />
        </div>
        {status ? (
          <div className={`rounded-xl border px-4 py-3 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`} role="status" aria-live="polite">
            {status.message}
          </div>
        ) : null}
        <button type="submit" disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-accent transition-all hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? tr.sending : tr.submit}
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}

