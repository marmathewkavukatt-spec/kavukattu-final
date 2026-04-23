"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SliderManagePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard/slider/view");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
        <p className="mt-4 text-stone-600">Redirecting...</p>
      </div>
    </div>
  );
}
