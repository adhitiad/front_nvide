"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BookingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/bookings");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      <p className="text-sm text-neutral-400 font-medium">
        Mengalihkan Anda ke halaman Booking NVide Live...
      </p>
    </div>
  );
}
