import { projects } from "@/content/projects";
import Hero from "@/components/Hero";
import RevealText from "@/components/RevealText";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <section id="work" className="scroll-mt-16 px-gutter py-section">
        <RevealText as="h2" className="font-display text-display-md uppercase leading-none">
          Selected work
        </RevealText>
        <ul className="mt-8 border-t border-line">
          {projects.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-baseline gap-x-6 border-b border-line py-4">
              <span className="font-display text-display-md uppercase leading-none">{p.title}</span>
              <span className="text-xs uppercase tracking-widest text-gray">
                {p.category} · {p.year} · {p.role}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <About />
      <Contact />
    </main>
  );
}
