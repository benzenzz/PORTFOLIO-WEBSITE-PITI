"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);

// Seconds; mirror --duration-* in globals.css.
export const DURATION = { fast: 0.16, base: 0.32, slow: 0.64 };
// Closest GSAP eases to --ease-out / --ease-in-out in globals.css.
export const EASE = { out: "power3.out", inOut: "power2.inOut" };

export const MOTION_QUERIES = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
};

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
