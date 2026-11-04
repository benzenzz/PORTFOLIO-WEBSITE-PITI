import Gallery from "@/components/Gallery";
import RevealText from "@/components/RevealText";
import { site } from "@/content/site";

// Restored by the owner's choice (gallery hero). Headline follows the work order: video → VFX → design.
export default function Hero() {
  return (
    <section data-surface="paper" className="grain flex min-h-svh flex-col gap-8 overflow-x-clip p-gutter pt-20 [--grain:0.05]">
      <RevealText as="p" split="words" trigger="load" className="text-xs uppercase tracking-widest text-gray">
        {site.name} — {site.role}
      </RevealText>
      <RevealText
        as="h1"
        trigger="load"
        delay={0.1}
        className="max-w-[14ch] text-balance break-words font-display text-display-lg uppercase leading-[0.92]"
      >
        Video, VFX, motion &amp; design<span className="text-red">.</span>
      </RevealText>
      <Gallery />
      <a
        href="#work"
        className="inline-flex min-h-11 items-center self-start border-b border-ink text-base uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red"
      >
        View selected work ↓
      </a>
    </section>
  );
}
