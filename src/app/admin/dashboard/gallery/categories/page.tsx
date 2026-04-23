import Link from "next/link";

const categorySections = [
  { 
    href: "/admin/dashboard/gallery/categories/add", 
    label: "Add Category", 
    desc: "Create a new gallery category",
    icon: "M12 4v16m8-8H4"
  },
  { 
    href: "/admin/dashboard/gallery/categories/view", 
    label: "View Categories", 
    desc: "View and manage existing categories",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
  },
];

export default function CategoriesPage() {
  return (
    <div>
      <Link 
        href="/admin/dashboard/gallery"
        className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 transition-colors"
      >
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Go Back
      </Link>
      
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-semibold text-stone-800">Manage Categories</h1>
      <p className="mt-2 text-base text-stone-600">Choose an option to manage gallery categories.</p>
      
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {categorySections.map((s) => (
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
