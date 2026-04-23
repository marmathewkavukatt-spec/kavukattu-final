import Link from "next/link";

const gallerySections = [
  { 
    href: "/admin/dashboard/gallery/categories", 
    label: "Manage Categories", 
    desc: "Add, edit, or delete gallery categories",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
  },
  { 
    href: "/admin/dashboard/gallery/images", 
    label: "Manage Images", 
    desc: "View and manage images by category",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
  },
];

export default function GalleryPage() {
  return (
    <div>
      <Link 
        href="/admin/dashboard"
        className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 transition-colors"
      >
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Go Back
      </Link>
      
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-semibold text-stone-800">Gallery Management</h1>
      <p className="mt-2 text-base text-stone-600">Choose an option to manage your gallery.</p>
      
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {gallerySections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group block rounded-xl border-2 border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-accent hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-accent/10 p-3 transition-colors group-hover:bg-accent/20">
                  <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-stone-800 group-hover:text-accent transition-colors">
                    {s.label}
                  </span>
                  <p className="mt-1 text-sm text-stone-500">{s.desc}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
