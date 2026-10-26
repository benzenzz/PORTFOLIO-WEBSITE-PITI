"use client";

import { useRef } from "react";
import { gsap, useGSAP, DURATION, EASE, MOTION_QUERIES } from "@/lib/gsap";

/** Fades its direct children in when scrolled into view. Content is visible without JS. */
export default function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = scope.current!.children;
      const scrollTrigger = { trigger: scope.current, start: "top 85%", once: true };
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        gsap.from(items, { autoAlpha: 0, y: 40, stagger: 0.08, duration: DURATION.slow, ease: EASE.out, scrollTrigger });
      });
      mm.add(MOTION_QUERIES.reduce, () => {
        gsap.from(items, { autoAlpha: 0, duration: DURATION.base, scrollTrigger });
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
