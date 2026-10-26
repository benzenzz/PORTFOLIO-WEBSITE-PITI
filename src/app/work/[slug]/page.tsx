import { Suspense, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, type Project } from "@/content/projects";
import RevealText from "@/components/RevealText";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// Same name as the clicked gallery tile, so the browser morphs the tile into this cover.
const Cover = ({ project, sizes, priority }: { project: Project; sizes: string; priority?: boolean }) =>
  project.cover ? (
    <ViewTransition name={`cover-${project.slug}`} share="morph" default="none">
      <Image src={project.cover} alt={project.title} fill sizes={sizes} priority={priority} className="object-cover" />
    </ViewTransition>
  ) : (
    <span className="grid h-full place-items-center text-xs uppercase tracking-widest text-gray">[Add cover image]</span>
  );

// params are awaited inside Suspense so navigations into this route stay instant.
export default function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <Suspense fallback={null}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

async function CaseStudy({ params }: { params: PageProps<"/work/[slug]">["params"] }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  const sections = [
    ["Context", project.context],
    ["My role", project.role],
    ["Process", project.process],
    ["Result", project.result],
  ];

  return (
    <main className="px-gutter py-section">
      <Link href="/#work" className="text-xs uppercase tracking-widest hover:text-red focus-visible:text-red">
        ← Back to work
      </Link>

      <header className="mt-8 flex flex-col gap-6">
        <RevealText as="h1" trigger="load" className="text-balance break-words font-display text-display-lg uppercase leading-[0.92]">
          {project.title}
        </RevealText>
        <dl className="grid grid-cols-3 gap-4 border-y border-line py-4 text-xs uppercase tracking-widest">
          {[
            ["Category", project.category],
            ["Year", project.year],
            ["Role", project.role],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-gray">{label}</dt>
              <dd className="mt-1">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="relative aspect-[3/2] overflow-hidden bg-ink/5">
          <Cover project={project} sizes="100vw" priority />
        </div>
      </header>

      <div className="mt-section flex flex-col gap-10">
        <p className="max-w-prose text-lg">{project.description}</p>
        {sections.map(([label, text]) => (
          <section key={label} className="grid gap-2 border-t border-line pt-4 md:grid-cols-[12rem_1fr]">
            <RevealText as="h2" className="font-display text-2xl uppercase leading-none">
              {label}
            </RevealText>
            <p className="max-w-prose">{text}</p>
          </section>
        ))}
      </div>

      <section className="mt-section">
        <RevealText as="h2" className="font-display text-display-md uppercase leading-none">
          Selected visuals
        </RevealText>
        {project.media.length ? (
          <ul className="mt-8 columns-1 gap-4 md:columns-2 [&>li]:mb-4 [&>li]:break-inside-avoid">
            {project.media.map((m, i) => (
              <li key={m.src}>
                {m.video ? (
                  <video src={m.src} controls playsInline preload="none" className="aspect-video w-full bg-ink" />
                ) : (
                  <Image
                    src={m.src}
                    alt={`${project.title} — image ${i + 1}`}
                    width={m.width!}
                    height={m.height!}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-auto w-full"
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-gray">[Add project media]</p>
        )}
      </section>

      <Link href={`/work/${next.slug}`} className="group mt-section flex items-end justify-between gap-6 border-t border-ink pt-6">
        <span>
          <span className="text-xs uppercase tracking-widest text-gray">Next project</span>
          <span className="mt-2 block font-display text-display-md uppercase leading-none transition-colors duration-[var(--duration-fast)] group-hover:text-red group-focus-visible:text-red">
            {next.title} →
          </span>
        </span>
        <span className="relative hidden aspect-[3/2] w-40 shrink-0 overflow-hidden bg-ink/5 sm:block">
          <Cover project={next} sizes="160px" />
        </span>
      </Link>
    </main>
  );
}
