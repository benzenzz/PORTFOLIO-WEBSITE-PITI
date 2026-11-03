"use client";

import { useEffect, useState } from "react";
import RevealText from "@/components/RevealText";
import { site, filled } from "@/content/site";

const label = "font-mono text-xs uppercase tracking-widest";
// Unconfirmed channels are visible (and marked) in development only, never shown as real details in production.
const showPlaceholders = process.env.NODE_ENV !== "production";

const channels = [
  ["Email", site.email, `mailto:${site.email}`],
  ["LinkedIn", site.linkedin, site.linkedin],
  ["Instagram", site.instagram, site.instagram],
  ["CV", site.cv, site.cv],
] as const;

export default function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = () => navigator.clipboard.writeText(site.email).then(() => setCopied(true), () => {}); // denied clipboard: the email stays visible to copy by hand

  const rows = channels.filter(([, value]) => filled(value) || showPlaceholders);

  return (
    <section id="contact" data-surface="red" className="grain flex min-h-svh scroll-mt-11 flex-col bg-red-field px-gutter py-section text-paper">
      <div aria-hidden className={`${label} flex justify-between gap-6 border-b border-paper/40 pb-3`}>
        <span>(04) Contact</span>
        <span>{site.wordmark}</span>
      </div>
      <RevealText as="h2" className="mb-8 mt-12 text-[length:clamp(3rem,0.5rem+14vw,13rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.05em]">
        Contact
      </RevealText>
      <p className="mb-12 max-w-[40ch] text-balance text-lg leading-snug">
        Open to {site.seeking} roles. {site.city} ({site.timezone}) · Remote · {site.availability}.
      </p>

      {rows.length > 0 ? (
        <ul className="mt-auto border-t border-paper">
          {rows.map(([name, value, href]) => (
            <li key={name} className="grid gap-3 border-b border-paper/40 py-5 md:grid-cols-12 md:items-center md:gap-x-[var(--space-gutter)]">
              <span className={`${label} md:col-span-3`}>{name}</span>
              {filled(value) ? (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-9">
                  <a
                    href={href}
                    {...(name === "CV" ? { download: true } : name !== "Email" && { target: "_blank", rel: "noopener noreferrer" })}
                    className="break-words text-[length:clamp(1.5rem,1rem+2.5vw,3.25rem)] font-extrabold leading-tight tracking-tight underline decoration-transparent decoration-2 underline-offset-8 transition-colors duration-[var(--duration-fast)] hover:decoration-paper"
                  >
                    {name === "Email" ? value : name === "CV" ? "Download CV ↓" : `${value.replace(/^https?:\/\/(www\.)?/, "")} ↗`}
                    {name !== "Email" && name !== "CV" && <span className="sr-only"> (opens in a new tab)</span>}
                  </a>
                  {name === "Email" && (
                    <button
                      type="button"
                      onClick={copy}
                      className={`${label} inline-flex min-h-11 items-center border border-paper px-4 transition-colors duration-[var(--duration-fast)] hover:bg-paper hover:text-red-field`}
                    >
                      {copied ? "Copied" : "Copy email"}
                    </button>
                  )}
                </div>
              ) : (
                <span className={`${label} self-start border border-dashed border-paper px-3 py-2 md:col-span-9 md:justify-self-start`}>
                  {value} — placeholder, hidden in production
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-auto text-lg">Contact details are coming soon.</p>
      )}
      <p role="status" className="sr-only">
        {copied ? "Email copied to clipboard" : ""}
      </p>
    </section>
  );
}
