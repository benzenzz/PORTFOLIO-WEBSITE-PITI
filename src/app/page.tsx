import { projects } from "@/content/projects";

export default function Home() {
  return (
    <main className="px-gutter py-section">
      <h1 className="font-display text-display-xl uppercase leading-[0.9]">
        [Your name]<span className="text-red">.</span>
      </h1>
      <p className="mt-6 text-lg">Selected work</p>
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
    </main>
  );
}
