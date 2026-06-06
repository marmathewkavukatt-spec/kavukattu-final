import Link from "next/link";

const sections = [
  { href: "/admin/dashboard/slider", label: "Home Slider", desc: "Manage hero slides on the home page" },
  { href: "/admin/dashboard/resources/view", label: "Syriac Studies", desc: "Syriac studies and links" },
  { href: "/admin/dashboard/favours-recieved", label: "Favours Recieved", desc: "Manage favours recieved" },
  { href: "/admin/dashboard/announcements", label: "Announcements", desc: "Manage announcements" },
  { href: "/admin/dashboard/gallery", label: "Gallery", desc: "Photo gallery" },
  { href: "/admin/dashboard/contributions", label: "Public Interventions", desc: "Testimonials, prayer requests, and intentions" },
  { href: "/admin/dashboard/archives/view", label: "Archives / Documents", desc: "Pastoral letters, circulars, and other files" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-semibold text-stone-800">Dashboard</h1>
      <p className="mt-2 text-base text-stone-600">Choose a section to manage content.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="font-medium text-base text-stone-800">{s.label}</span>
              <p className="mt-1 text-sm text-stone-500">{s.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
