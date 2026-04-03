import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "AceTheClock",
  description: "Premium CAT-style mock platform with AI-ready PDF ingestion and performance analytics."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
