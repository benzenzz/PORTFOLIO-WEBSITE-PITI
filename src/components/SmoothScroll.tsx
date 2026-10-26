"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, useGSAP, MOTION_QUERIES } from "@/lib/gsap";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useGSAP(() => {
    // Reduced motion: no branch matches, so the page keeps native scroll.
    gsap.matchMedia().add(MOTION_QUERIES.motion, () => {
      const lenis = new Lenis({ autoRaf: false, anchors: true }) // anchors: smooth-scrolls in-page links like the hero CTA;
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    });
  });

  return children;
}
