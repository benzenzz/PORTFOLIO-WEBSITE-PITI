import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import { site } from "@/content/site";
import { loaderGateScript } from "@/lib/loader";
import Script from "next/script";

// Anton: heavy, tall, condensed grotesque — matches the poster-like headlines of the moodboard;
// has Vietnamese glyphs. Inter: neutral, highly legible UI/body face that stays out of the work's way.
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin", "vietnamese"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Demi Phan — Portfolio",
  description: "Personal creative portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
      <body>
        <Script id="loader-gate" strategy="beforeInteractive">
          {loaderGateScript}
        </Script>
        <Loader />
        <Header />
        <SmoothScroll>{children}</SmoothScroll>
        <footer className="flex flex-wrap justify-between gap-2 bg-ink px-gutter py-6 text-xs uppercase tracking-widest text-paper/70">
          <span>{site.name}</span>
          <span>{site.role}</span>
        </footer>
      </body>
    </html>
  );
}
