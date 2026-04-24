"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import ContactFormCard from "./ContactFormCard";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function ContactsSection({ showHeader = true }: { showHeader?: boolean }) {
  const { lang } = useLang();
  const tr = t[lang];

  return (
    <div className="bg-stone-50">
      {showHeader && (
        <div className="bg-accent py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white">{tr.contactUs}</h1>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="order-2 mt-4 lg:order-1 lg:col-span-1 lg:mt-0">
            <ContactFormCard />
          </div>
          <div className="order-1 space-y-12 lg:order-2 lg:col-span-2">
            <div>
              <h2 className="mb-6 font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900">{tr.getInTouch}</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-accent shadow-sm ring-1 ring-stone-200">
                    <MapPin className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif mt-4 text-xl md:text-2xl font-bold text-stone-900">{tr.address}</h3>
                  <p className="mt-2 text-base leading-relaxed text-stone-600">
                    Cause for the Beatification of Mar Mathew Kavukatt<br />
                    St Mary&apos;s Metropolitan Church<br />
                    Changanassery<br />
                    Kottayam
                  </p>
                </div>
                <div className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-accent shadow-sm ring-1 ring-stone-200">
                    <Phone className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif mt-4 text-xl md:text-2xl font-bold text-stone-900">{tr.phone}</h3>
                  <div className="mt-2 space-y-1">
                    <a href="tel:+918547584954" className="block text-base text-accent hover:underline">+91 85475 84954</a>
                    <p className="text-xs text-stone-500">Vice postulator</p>
                  </div>
                </div>
                <div className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-accent shadow-sm ring-1 ring-stone-200">
                    <Mail className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif mt-4 text-xl md:text-2xl font-bold text-stone-900">{tr.email}</h3>
                  <div className="mt-2 space-y-1">
                    <a href="mailto:markavukattmuseum@gmail.com" className="block text-base text-accent hover:underline">
                      markavukattmuseum@gmail.com
                    </a>
                  </div>
                </div>
                <div className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-accent shadow-sm ring-1 ring-stone-200">
                    <Clock className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif mt-4 text-xl md:text-2xl font-bold text-stone-900">{tr.officeHours}</h3>
                  <p className="mt-2 text-base leading-relaxed text-stone-600 whitespace-pre-line">{tr.officeHoursValue}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-md">
              <h2 className="mb-4 font-serif text-2xl md:text-3xl font-bold text-stone-900">{tr.socialWithUs}</h2>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/share/v/1BKHmoTwS3/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl" aria-label="Instagram">
                  <Instagram className="h-6 w-6" />
                </a>
                <Link
                  href="/youtube"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                  aria-label="YouTube"
                >
                  <Youtube className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
