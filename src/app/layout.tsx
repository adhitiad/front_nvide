import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "NVide Live",
  description: "NVide Live streaming platform",
  manifest: "/manifest.json",
};

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LanguageInitializer from "@/components/layout/LanguageInitializer";
import ThemeInitializer from "@/components/layout/ThemeInitializer";
import PWARegister from "@/components/layout/PWARegister";
import BottomNavigation from "@/components/layout/BottomNavigation";
import QueryProvider from "@/components/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-900 text-foreground font-sans antialiased">
        <ThemeInitializer />
        <PWARegister />
        <LanguageInitializer />
        
        {/* Responsive Container — full-width on all screens */}
        <div className="flex-1 w-full max-w-7xl mx-auto bg-background min-h-screen relative overflow-x-hidden">
          <QueryProvider>
            {children}
            <BottomNavigation />
          </QueryProvider>
        </div>
        
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
