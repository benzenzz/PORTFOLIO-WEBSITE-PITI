"use client";

import { useRef } from "react";
import Link from "next/link";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

const LINKS = [
  ["Work", "/#work"],
  ["About", "/#about"],
  ["Contact", "/#contact"],
];

const linkClass = "uppercase transition-colors duration-[var(--duration-fast)] hover:text-red";

export default function Header() {
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDialogElement>(null);

  // Hide while scrolling down, show on the way up. CSS keeps it shown while it holds focus.
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => header.current!.toggleAttribute("data-hidden", self.direction === 1 && self.scroll() > 80),
    });
  });

  // Native modal <dialog>: traps focus, closes on Esc and returns focus to the Menu button.
  const close = () => menu.current?.close();

  return (
    <header
      ref={header}
      className="site-header fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-paper/90 px-gutter py-3 text-xs backdrop-blur-sm"
    >
      <Link href="/" className={`${linkClass} font-semibold tracking-widest`}>
        Demi Phan
      </Link>
      <nav aria-label="Main" className="max-md:hidden">
        <ul className="flex gap-6">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link href={href} className={`${linkClass} tracking-widest`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" onClick={() => menu.current?.showModal()} className={`${linkClass} tracking-widest md:hidden`} aria-haspopup="dialog">
        Menu
      </button>

      <dialog ref={menu} aria-label="Menu" className="menu-overlay bg-ink text-paper" data-lenis-prevent>
        <div className="flex min-h-full flex-col p-gutter">
          <button type="button" onClick={close} className={`${linkClass} self-end text-xs tracking-widest`}>
            Close
          </button>
          <nav aria-label="Main" className="my-auto">
            <ul className="flex flex-col gap-4">
              {LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} onClick={close} className={`${linkClass} font-display text-display-lg leading-none`}>
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
