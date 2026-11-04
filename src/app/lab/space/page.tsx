import type { Metadata } from "next";
import SpaceLab from "@/components/lab/SpaceLab";

// Owner-review prototype of the Selected Work space (Rings / Spiral). Not linked from the site and not indexed.
export const metadata: Metadata = {
  title: "Spatial gallery prototype — Demi Phan",
  robots: { index: false, follow: false },
};

export default function SpaceLabPage() {
  return (
    <main>
      <SpaceLab />
    </main>
  );
}
