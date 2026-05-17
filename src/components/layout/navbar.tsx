"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Gagal keluar:", error);
      router.push("/");
    }
  };

  return (
    <div className="flex items-center p-4 bg-[#111827] text-white border-b border-neutral-800">
      <div className="flex w-full justify-end">
        <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-neutral-800" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
