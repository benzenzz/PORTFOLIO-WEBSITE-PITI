import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import { site } from "@/content/site";
import { loaderGateScript } from "@/lib/loader";

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
      <body id="top">
        {/* Plain inline script, not next/script: beforeInteractive is queued until the Next runtime loads,
            which kept the loader covering every page for seconds on slow devices. This runs at parse time. */}
        <script dangerouslySetInnerHTML={{ __html: loaderGateScript }} />
        <Loader />
        <Header />
        <SmoothScroll>{children}</SmoothScroll>
        {/* Wordmark and copyright are separate: no "PITI©" unless the owner approves it. */}
        <footer data-surface="ink" className="grain flex flex-wrap items-center justify-between gap-x-6 bg-ink px-gutter py-3 text-xs text-paper">
          <span className="text-base font-extrabold tracking-tight">{site.wordmark}</span>
          <span className="font-mono uppercase tracking-widest text-gray-on-ink">
            © {site.name}
          </span>
          <a href="#top" className="inline-flex min-h-11 items-center font-mono uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:text-red">
            Back to top ↑
          </a>
        </footer>
      </body>
    </html>
  );
}
