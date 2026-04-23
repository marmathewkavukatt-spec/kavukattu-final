"use client";

import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }
  return (
    <button type="button" onClick={handleLogout} className="text-sm text-stone-600 hover:text-red-600">
      Logout
    </button>
  );
}
