"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, DURATION, EASE, MOTION_QUERIES } from "@/lib/gsap";
import { whenLoaderDone } from "@/lib/loader";

type Props = {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  /** Split into masked lines or words. */
  split?: "lines" | "words";
  delay?: number;
  /** "scroll": reveal when it enters the viewport. "load": reveal once the loader is done (hero). */
  trigger?: "scroll" | "load";
};

export default function RevealText({
  children,
  as: Tag = "p",
  className,
  split = "lines",
  delay = 0,
  trigger = "scroll",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const scrollTrigger = trigger === "scroll" ? { trigger: el, start: "top 85%", once: true } : undefined;
      let stopWaiting = () => {};
      // Starts paused for "load" so the hero waits for the loader.
      const start = (tween: gsap.core.Tween) => {
        if (trigger === "load") stopWaiting = whenLoaderDone(() => tween.play());
        return tween;
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        SplitText.create(el, {
          type: split,
          mask: split,
          autoSplit: true, // re-splits on resize and font load; returned tween keeps its progress
          onSplit: (self) =>
            start(
              gsap.from(self[split], {
                yPercent: 110,
                stagger: split === "lines" ? 0.08 : 0.04,
                duration: DURATION.slow * 1.4,
                ease: EASE.out,
                delay,
                scrollTrigger,
                paused: trigger === "load",
              }),
            ),
        });
      });
      mm.add(MOTION_QUERIES.reduce, () => {
        start(gsap.from(el, { autoAlpha: 0, duration: DURATION.base, delay, scrollTrigger, paused: trigger === "load" }));
      });
      return () => stopWaiting();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
