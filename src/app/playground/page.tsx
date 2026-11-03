import type { Metadata } from "next";
import Image from "next/image";
import RevealText from "@/components/RevealText";
import { playground } from "@/content/projects";

export const metadata: Metadata = { title: "Playground — Demi Phan" };

const label = "font-mono text-xs uppercase tracking-widest text-gray";

// Personal experiments: looser grid than the work index, but every piece keeps its label.
export default function Playground() {
  return (
    <main className="px-gutter pb-section pt-28">
      <p className={label}>02 — Playground</p>
      <RevealText as="h1" trigger="load" className="mt-4 text-display-lg font-extrabold uppercase leading-[0.85] tracking-[-0.04em]">
        Playground
      </RevealText>
      <p className="mt-6 max-w-prose text-lg">[1 line: what this page is — personal experiments, things I am trying]</p>

      <ul className="mt-section grid gap-section">
        {playground.map((p) => (
          <li key={p.slug} className="grid gap-6 md:grid-cols-12">
            <div className="flex flex-col gap-2 md:col-span-3">
              <h2 className="text-3xl font-extrabold uppercase leading-none tracking-tight">{p.title}</h2>
              <p className={label}>
                {p.tags.join(" · ")} · {p.year}
              </p>
              <p className="text-sm">{p.summary}</p>
            </div>
            <div className="columns-2 gap-3 md:col-span-9 md:columns-3 [&>*]:mb-3 [&>*]:break-inside-avoid">
              {p.media
                .filter((m) => !m.video)
                .map((m, i) => (
                  <Image
                    key={m.src}
                    src={m.src}
                    alt={`${p.title} — ${i + 1}`}
                    width={m.width!}
                    height={m.height!}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="h-auto w-full"
                  />
                ))}
            </div>
          </li>
        ))}
        <li className={`${label} grid min-h-40 place-items-center border border-dashed border-line`}>[Add experiment: motion / visual test]</li>
      </ul>
    </main>
  );
}
