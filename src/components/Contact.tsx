"use client";

import { useEffect, useState } from "react";
import RevealText from "@/components/RevealText";
import { site, filled } from "@/content/site";
import { CvLink } from "@/components/About";

const pill =
  "border border-paper px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = () => navigator.clipboard.writeText(site.email).then(() => setCopied(true), () => {}); // denied clipboard: the email stays visible to copy by hand

  return (
    <section id="contact" className="scroll-mt-16 bg-ink px-gutter py-section text-paper">
      <RevealText as="h2" className="text-xs uppercase tracking-widest">
        Contact
      </RevealText>
      <p className="mt-6 max-w-prose text-lg">Open to {site.seeking} roles.</p>
      {filled(site.email) ? (
        <a
          href={`mailto:${site.email}`}
          className="mt-8 block break-words font-display text-display-lg leading-none underline decoration-transparent decoration-2 underline-offset-8 transition-colors duration-[var(--duration-base)] hover:text-red hover:decoration-red"
        >
          {site.email}
        </a>
      ) : (
        <p className="mt-8 font-display text-display-lg leading-none">{site.email}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={copy} className={pill}>
          {copied ? "Copied" : "Copy email"}
        </button>
        {filled(site.linkedin) ? (
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={pill}>
            LinkedIn ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="px-4 py-2 text-xs uppercase tracking-widest">LinkedIn: {site.linkedin}</span>
        )}
        <CvLink className={filled(site.cv) ? pill : "px-4 py-2 text-xs uppercase tracking-widest"} />
      </div>
      <p className="mt-8 text-xs uppercase tracking-widest text-paper/70">
        {site.city} ({site.timezone}) · Remote · {site.availability}
      </p>
      <p role="status" className="sr-only">
        {copied ? "Email copied to clipboard" : ""}
      </p>
    </section>
  );
}
