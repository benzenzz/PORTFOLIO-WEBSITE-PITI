"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE } from "@/lib/gsap";
import { LOADER_DONE, LOADER_TIMING } from "@/lib/loader";

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
      // Total 1.8s; the card deck finishes its own intro by 2.5s.
      gsap
        .timeline({ onComplete: finish })
        .to(n, {
          v: 100,
          duration: LOADER_TIMING.count,
          ease: "power2.inOut",
          onUpdate: () => {
            count.current!.textContent = String(Math.round(n.v));
          },
        })
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: LOADER_TIMING.reveal, ease: EASE.inOut });
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
