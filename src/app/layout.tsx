import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NVide Live",
  description: "NVide Live streaming platform",
  manifest: "/manifest.json",
};

import { Toaster } from "@/components/ui/sonner";
import LanguageInitializer from "@/components/layout/LanguageInitializer";
import ThemeInitializer from "@/components/layout/ThemeInitializer";
import PWARegister from "@/components/layout/PWARegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased">
        <ThemeInitializer />
        <PWARegister />
        <LanguageInitializer />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
