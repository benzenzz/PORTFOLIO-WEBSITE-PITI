"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { MOTION_QUERIES } from "@/lib/gsap";

const POSTER = "/hero/change-hero-poster.jpg";
const SOURCES = { desktop: "/hero/change-hero.mp4", mobile: "/hero/change-hero-mobile.mp4" };

// shortcut: source is read once per mount, not on resize/preference change; upgrade if orientation changes matter.
const subscribe = () => () => {};
const pickSource = () => {
  if (window.matchMedia(MOTION_QUERIES.reduce).matches) return null;
  return window.matchMedia("(max-width: 767px)").matches ? SOURCES.mobile : SOURCES.desktop;
};

// Poster is the SSR/no-JS/reduced-motion state; the video mounts over it after hydration.
export default function HeroVideo() {
  const src = useSyncExternalStore(subscribe, pickSource, () => null);

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <Image src={POSTER} alt="" fill priority sizes="100vw" className="object-cover" />
      {src && <video key={src} src={src} poster={POSTER} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-ink/30" />
    </div>
  );
}
