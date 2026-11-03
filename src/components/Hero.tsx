import RevealText from "@/components/RevealText";
import { site } from "@/content/site";
import { featured } from "@/content/projects";

const label = "font-mono text-xs uppercase tracking-widest text-gray";
const pad = (n: number) => String(n).padStart(2, "0");

// Every label here is derived from content config (name, role, capabilities, project count): no invented biography.
// Gallery.tsx is kept for rollback; the Selected Work stage below is now the work-discovery experience.
export default function Hero() {
  return (
    <section data-surface="paper" className="grain flex min-h-svh flex-col overflow-x-clip px-gutter pb-gutter pt-20 [--grain:0.05]">
      <div aria-hidden className={`${label} flex justify-between gap-6`}>
        <span>(01) Introduction</span>
        <span>
          {site.wordmark} — Portfolio
        </span>
      </div>

      <div className="mt-auto grid gap-y-10 pt-16 md:grid-cols-12 md:items-end md:gap-x-[var(--space-gutter)]">
        <RevealText
          as="h1"
          effect="smear"
          trigger="load"
          className="font-extrabold leading-[0.8] tracking-[-0.05em] text-[length:clamp(5rem,2rem+15vw,17rem)] md:col-span-8"
        >
          {site.name.split(" ").map((word, i, all) => (
            <span key={word} className="block">
              {word}
              {i === all.length - 1 && <span className="text-red">.</span>}
            </span>
          ))}
        </RevealText>

        <div className="flex flex-col gap-8 md:col-span-4 md:pb-3">
          <RevealText as="p" split="words" trigger="load" delay={0.15} className="text-lg font-semibold leading-tight tracking-tight">
            {site.role}
          </RevealText>
          <ol aria-label="Disciplines" className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {site.capabilities.map((c, i) => (
              <li key={c} className="flex gap-2 uppercase tracking-widest">
                <span className="font-mono text-gray">{pad(i + 1)}</span>
                {c}
              </li>
            ))}
          </ol>
          <a
            href="#work"
            className="group inline-flex min-h-11 items-center gap-2 self-start border-b-2 border-ink text-base font-semibold uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:border-red-text hover:text-red-text"
          >
            View selected work
            <span aria-hidden className="transition-transform duration-[var(--duration-fast)] group-hover:translate-y-1">
              ↓
            </span>
          </a>
        </div>
      </div>

      <div aria-hidden className={`${label} mt-10 flex justify-between gap-6`}>
        <span>Scroll</span>
        <span>{pad(featured.length)} selected projects</span>
      </div>
    </section>
  );
}
