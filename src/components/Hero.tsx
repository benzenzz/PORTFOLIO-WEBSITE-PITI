import CardDeck from "@/components/CardDeck";
import RevealText from "@/components/RevealText";

// Disciplines come from the content-raw/ folders; name and intro are not supplied yet.
export default function Hero() {
  return (
    <section className="flex min-h-svh flex-col gap-8 overflow-x-clip p-gutter">
      <div className="flex flex-1 flex-col justify-center">
        <CardDeck />
      </div>
      <RevealText as="p" split="words" trigger="load" className="text-xs uppercase tracking-widest text-gray">
        [Your name] — [Role, city]
      </RevealText>
      <RevealText
        as="h1"
        trigger="load"
        delay={0.1}
        className="max-w-[14ch] text-balance break-words font-display text-display-lg uppercase leading-[0.92]"
      >
        Design, photography, motion &amp; video<span className="text-red">.</span>
      </RevealText>
      <a
        href="#work"
        className="self-start border-b border-ink pb-1 text-base uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red"
      >
        View selected work ↓
      </a>
    </section>
  );
}
