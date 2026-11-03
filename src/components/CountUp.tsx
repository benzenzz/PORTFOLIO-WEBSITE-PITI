"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, EASE, MOTION_QUERIES } from "@/lib/gsap";
import type { Metric } from "@/content/site";

const format = (m: Metric, v: number) =>
  `${m.prefix ?? ""}${v.toLocaleString("en-US", { minimumFractionDigits: m.decimals ?? 0, maximumFractionDigits: m.decimals ?? 0 })}${m.suffix ?? ""}`;

/**
 * Counts 0 → final once, the first time it enters the viewport. The final text is always in the DOM:
 * it reserves the width (invisible sizer) and is what assistive tech reads; the animated copy is aria-hidden.
 * Reduced motion / no JS: the final value is simply shown.
 */
export default function CountUp({ metric, delay = 0, className }: { metric: Metric; delay?: number; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const live = useRef<HTMLSpanElement>(null);
  const final = format(metric, metric.value);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_QUERIES.motion, () => {
        const n = { v: 0 };
        const draw = () => (live.current!.textContent = format(metric, n.v));
        draw();
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.to(n, { v: metric.value, duration: 1.4, delay, ease: EASE.out, onUpdate: draw }),
        });
      });
    },
    { scope: root },
  );

  return (
    <span ref={root} className={`inline-grid tabular-nums ${className ?? ""}`}>
      <span className="sr-only">{final}</span>
      <span aria-hidden className="invisible [grid-area:1/1]">
        {final}
      </span>
      <span ref={live} aria-hidden className="[grid-area:1/1]">
        {final}
      </span>
    </span>
  );
}
