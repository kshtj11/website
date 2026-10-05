import type { Metadata } from "next";
import { Hanken_Grotesk, Hind } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

// Site typefaces (downloaded at build time and served from this site):
//   Hanken Grotesk — all Latin text · Hind — Devanagari (नमस्कार etc.)
const hanken = Hanken_Grotesk({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-hanken",
  display: "swap",
});
const hind = Hind({ weight: ["400", "500", "600", "700"], subsets: ["devanagari"], variable: "--font-hind", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: { title: site.title, description: site.description, url: site.url, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${hind.variable}`}>
      <body>{children}</body>
    </html>
  );
}
