import CountUp from "@/components/CountUp";
import RevealText from "@/components/RevealText";
import { site } from "@/content/site";

const label = "font-mono text-xs uppercase tracking-widest text-gray";
const pad = (n: number) => String(n).padStart(2, "0");

const Row = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div className="grid gap-3 border-b border-line py-5 sm:grid-cols-[11rem_1fr]">
    <dt className={label}>
      {pad(n)} {title}
    </dt>
    <dd>{children}</dd>
  </div>
);

// Content comes from site.ts as supplied; nothing here is re-verified until the résumé is confirmed.
export default function About() {
  return (
    <section id="about" data-surface="paper" className="grain scroll-mt-11 px-gutter py-section [--grain:0.05]">
      <div aria-hidden className={`${label} flex justify-between gap-6 border-b border-line pb-3`}>
        <span>(03) About</span>
        <span>{site.name}</span>
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-12 md:gap-x-[var(--space-gutter)]">
        <div className="md:col-span-5">
          <RevealText as="h2" className="text-display-lg font-extrabold uppercase leading-[0.85] tracking-[-0.04em]">
            About
          </RevealText>
          <RevealText as="p" split="words" className="mt-8 max-w-[32ch] text-balance text-lg leading-snug">
            {site.intro}
          </RevealText>
        </div>

        <dl className="border-t border-ink md:col-span-7">
          <Row n={1} title="Work categories">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {site.capabilities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Row>
          <Row n={2} title="Tools">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {site.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Row>
          <Row n={3} title="Highlights">
            <ul className="flex flex-col gap-10">
              {site.highlights.map((h) => (
                <li key={h.title}>
                  <p className="flex flex-wrap items-baseline gap-x-3 font-bold tracking-tight">
                    {h.title}
                    {h.period && <span className={label}>{h.period}</span>}
                  </p>
                  {/* Lead figure large (and red), the rest smaller: scale and reach read first, copy second. */}
                  <dl className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
                    {h.metrics.map((m, i) => (
                      <div key={m.label} className="flex flex-col-reverse">
                        <dt className={`${label} mt-1`}>{m.label}</dt>
                        <dd
                          className={`font-extrabold leading-none tracking-[-0.04em] ${
                            i === 0 ? "text-[length:clamp(2.5rem,1.5rem+3.5vw,4.5rem)] text-red-text" : "text-[length:clamp(1.5rem,1rem+1.5vw,2.25rem)]"
                          }`}
                        >
                          <CountUp metric={m} delay={i * 0.12} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 max-w-prose">{h.body}</p>
                  {h.note && <p className="mt-1 max-w-prose text-sm text-gray">{h.note}</p>}
                </li>
              ))}
            </ul>
          </Row>
          <Row n={4} title="Background">
            <ul className="flex flex-col gap-1">
              {site.background.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </Row>
          <Row n={5} title="Websites">
            <ul className="flex flex-col">
              {site.sites.map(([name, url]) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center underline decoration-ink underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-red-text hover:decoration-red-text hover:decoration-2"
                  >
                    {name} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </Row>
        </dl>
      </div>
    </section>
  );
}
