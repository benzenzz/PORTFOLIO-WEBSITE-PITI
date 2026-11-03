import Image from "next/image";
import Link from "next/link";
import RevealText from "@/components/RevealText";
import { site, filled } from "@/content/site";
import { projects } from "@/content/projects";

const label = "text-xs uppercase tracking-widest text-gray";
const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;
const linkClass = "border-b border-ink hover:border-red hover:text-red focus-visible:text-red";

export const CvLink = ({ className = "" }: { className?: string }) =>
  filled(site.cv) ? (
    <a href={site.cv} download className={className}>
      Download CV ↓
    </a>
  ) : (
    <span className={className}>CV: {site.cv}</span>
  );

export default function About() {
  return (
    <section id="about" className="scroll-mt-16 border-t border-line px-gutter py-section">
      <p className={label}>About</p>
      <RevealText as="h2" className="mt-6 max-w-[18ch] text-balance font-display text-display-md uppercase leading-[0.95]">
        {site.statement}
      </RevealText>

      <div className="mt-section grid gap-12 md:grid-cols-12">
        <div className="flex flex-col gap-8 md:col-span-5">
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden bg-ink/5">
            {filled(site.portrait) ? (
              <Image src={site.portrait} alt={site.name} fill sizes="(min-width: 768px) 24rem, 100vw" className="object-cover grayscale" />
            ) : (
              <span className={`${label} absolute inset-0 grid place-items-center`}>{site.portrait}</span>
            )}
          </div>
          <div className="flex max-w-prose flex-col gap-3 text-lg leading-snug">
            {site.bio.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-4 border-y border-line py-4 text-sm">
            {[
              ["Based in", `${site.city} (${site.timezone})`],
              ["Availability", `${site.availability} · Remote`],
              ["Studying", `${site.major}, ${site.school}`],
              ["English", site.english],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className={label}>{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
          <CvLink className={`self-start text-xs uppercase tracking-widest ${filled(site.cv) ? linkClass : "text-gray"}`} />
        </div>

        <div className="flex flex-col gap-16 md:col-span-7">
          <div>
            <h3 className={label}>Experience</h3>
            <ol className="mt-3 border-t border-line">
              {site.experience.map((e) => (
                <li key={e.org} className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-line py-3">
                  <span className="text-sm tabular-nums text-gray">{e.year}</span>
                  <span>
                    <span className="font-semibold">{e.org}</span> — {e.role}
                    <span className="block text-sm text-gray">{e.note}</span>
                    {e.slug && (
                      <Link href={`/work/${e.slug}`} className={`mt-1 inline-block text-xs uppercase tracking-widest ${linkClass}`}>
                        See the work →
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className={label}>Capabilities</h3>
            <ul className="mt-3 grid gap-x-6 border-t border-line sm:grid-cols-2">
              {site.capabilities.map((c) => (
                <li key={c.name} className="border-b border-line py-3">
                  <span className="font-display text-2xl uppercase leading-none">{c.name}</span>
                  <span className="mt-1 flex flex-wrap gap-x-3 text-sm">
                    {c.proof.map((slug) => (
                      <Link key={slug} href={`/work/${slug}`} className={linkClass}>
                        {titleOf(slug)}
                      </Link>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className={label}>How I work</h3>
              <ol className="mt-3 flex list-decimal flex-col gap-1 pl-5">
                {site.howIWork.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className={label}>Tools</h3>
                <p className="mt-3">{site.tools.join(" · ")}</p>
              </div>
              <div>
                <h3 className={label}>Websites</h3>
                <ul className="mt-3 flex flex-col gap-1">
                  {site.sites.map(([name, url]) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {name} ↗<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
