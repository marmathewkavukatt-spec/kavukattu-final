"use client";

import { MapPin, Phone, Mail, Clock, Instagram, Youtube } from "lucide-react";
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
                <a href="https://whatsapp.com/channel/0029VaFkYYa9sBIB1ALIPj3X" target="_blank" rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl" aria-label="WhatsApp">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl" aria-label="Instagram">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://youtu.be/p9J0unIRmzI?si=trnWyFq7qgqu8mVs" target="_blank" rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl" aria-label="YouTube">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
