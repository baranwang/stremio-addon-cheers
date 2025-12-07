import type { Metadata } from "next";
import pkg from "@/../package.json" with { type: "json" };
import { Toaster } from "@/components/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: pkg.displayName,
  description: pkg.description,
  icons: pkg.icon,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
