"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CallRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/call/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      <p className="text-sm text-neutral-400 font-medium">
        Mengalihkan Anda ke ruang Panggilan Privat WebRTC NVide...
      </p>
    </div>
  );
}
