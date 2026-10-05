import type { Metadata } from "next";
import { Hanken_Grotesk, Hind } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

// Intro wordmark fonts. next/font downloads them at build time and serves them from this site.
const hind = Hind({ weight: "700", subsets: ["devanagari", "latin"], variable: "--font-intro-hi", display: "swap" });
const hanken = Hanken_Grotesk({ weight: "800", subsets: ["latin"], variable: "--font-intro-en", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: { title: site.title, description: site.description, url: site.url, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hind.variable} ${hanken.variable}`}>
      <head>
        <link rel="preload" href="/fonts/figtree-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
