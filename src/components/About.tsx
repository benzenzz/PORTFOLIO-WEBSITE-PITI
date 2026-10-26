import RevealText from "@/components/RevealText";
import { site } from "@/content/site";

const label = "text-xs uppercase tracking-widest text-gray";

const List = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h3 className={label}>{title}</h3>
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

export default function About() {
  return (
    <section id="about" className="scroll-mt-16 border-t border-line px-gutter py-section">
      <RevealText as="h2" className="font-display text-display-md uppercase leading-none">
        About
      </RevealText>
      <RevealText as="p" split="words" className="mt-8 max-w-[32ch] text-balance text-lg leading-snug">
        {site.intro}
      </RevealText>

      <div className="mt-section grid gap-12 md:grid-cols-[2fr_1fr]">
        <div>
          <h3 className={label}>Highlights</h3>
          <ul className="mt-3 border-t border-line">
            {site.highlights.map((h) => (
              <li key={h} className="max-w-prose border-b border-line py-3">
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-8">
          <List title="Capabilities" items={site.capabilities} />
          <List title="Tools" items={site.tools} />
          <div>
            <h3 className={label}>Websites</h3>
            <ul className="mt-3 flex flex-col gap-1">
              {site.sites.map(([name, url]) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="border-b border-ink hover:border-red hover:text-red">
                    {name} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
