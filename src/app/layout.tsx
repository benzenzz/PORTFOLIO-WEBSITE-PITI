import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

// Anton: heavy, tall, condensed grotesque — matches the poster-like headlines of the moodboard;
// has Vietnamese glyphs. Inter: neutral, highly legible UI/body face that stays out of the work's way.
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin", "vietnamese"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal creative portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
