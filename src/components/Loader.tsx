"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE } from "@/lib/gsap";
import { LOADER_DONE } from "@/lib/loader";

export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (!html.hasAttribute("data-loader")) return;

      const finish = () => {
        html.removeAttribute("data-loader");
        try {
          sessionStorage.setItem("loaderSeen", "1");
        } catch {}
        window.dispatchEvent(new Event(LOADER_DONE));
      };

      const n = { v: 0 };
      // Total 1.7s, under the 1.8s budget in PLAN.md.
      gsap
        .timeline({ onComplete: finish })
        .to(n, {
          v: 100,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            count.current!.textContent = String(Math.round(n.v));
          },
        })
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: EASE.inOut });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="loader" aria-hidden="true">
      <span ref={count} className="font-display text-display-xl leading-none tabular-nums">
        0
      </span>
    </div>
  );
}
