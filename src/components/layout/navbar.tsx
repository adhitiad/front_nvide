"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
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
