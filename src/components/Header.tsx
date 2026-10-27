"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/content/site";

const LINKS = [
  ["Work", "/#work"],
  ["About", "/#about"],
  ["Contact", "/#contact"],
];

const linkClass =
  "inline-flex min-h-11 items-center uppercase decoration-1 underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:underline";

export default function Header() {
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const pathname = usePathname();

  // Hide while scrolling down, show on the way up. CSS keeps it shown while it holds focus.
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => header.current!.toggleAttribute("data-hidden", self.direction === 1 && self.scroll() > 80),
    });
  });

  // Match the surface under the header (paper / ink / red) and mark the section being read.
  // Pages without data-surface sections keep the default paper header.
  // Re-binds per route: the header outlives client navigation, the sections don't.
  useEffect(() => {
    header.current!.dataset.surface = "paper";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          header.current!.dataset.surface = el.dataset.surface;
          setCurrent(el.id || null);
        }
      },
      { rootMargin: "-2% 0px -97% 0px" }, // a thin band level with the header
    );
    document.querySelectorAll("[data-surface]:not(header)").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      setCurrent(null);
    };
  }, [pathname]);

  // Native modal <dialog>: traps focus, closes on Esc and returns focus to the Menu button.
  const close = () => menu.current?.close();

  return (
    <header ref={header} data-surface="paper" className="site-header fixed inset-x-0 top-0 z-40 flex items-center justify-between px-gutter text-xs">
      <Link href="/" className="inline-flex min-h-11 items-center">
        <span className="flex items-baseline gap-3">
          <span className="text-base font-extrabold tracking-tight">{site.wordmark}</span>
          <span className="font-mono uppercase tracking-widest max-sm:hidden">{site.name}</span>
        </span>
      </Link>
      <nav aria-label="Main" className="max-md:hidden">
        <ul className="flex gap-6">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link href={href} aria-current={current === href.slice(2) ? "location" : undefined} className={`${linkClass} tracking-widest`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" onClick={() => menu.current?.showModal()} className={`${linkClass} min-w-11 justify-end tracking-widest md:hidden`} aria-haspopup="dialog">
        Menu
      </button>

      <dialog ref={menu} aria-label="Menu" className="menu-overlay grain bg-ink text-paper" data-lenis-prevent>
        <div className="flex min-h-full flex-col p-gutter">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold tracking-tight">{site.wordmark}</span>
            <button type="button" onClick={close} className={`${linkClass} text-xs tracking-widest`}>
              Close
            </button>
          </div>
          <nav aria-label="Main" className="my-auto">
            <ul className="flex flex-col gap-4">
              {LINKS.map(([label, href], i) => (
                <li key={href}>
                  <Link href={href} onClick={close} className={`${linkClass} items-baseline gap-4 text-display-lg font-extrabold leading-none tracking-[-0.04em]`}>
                    <span className="font-mono text-xs font-normal tracking-widest text-gray-on-ink">{String(i + 1).padStart(2, "0")}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
