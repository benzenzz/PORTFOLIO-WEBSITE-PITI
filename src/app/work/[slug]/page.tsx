import { Suspense, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { thumbOf, workProjects, type Project } from "@/content/projects";
import RevealText from "@/components/RevealText";
import YouTube from "@/components/YouTube";

export function generateStaticParams() {
  return workProjects.map((p) => ({ slug: p.slug }));
}

const label = "font-mono text-xs uppercase tracking-widest";
// Poster frames sit next to each clip (same name, .jpg), made with ffmpeg.
const posterOf = (src: string) => src.replace(/\.mp4$/, ".jpg");
const num = (i: number) => String(i + 1).padStart(2, "0");

// Same name as the clicked gallery tile, so the browser morphs the tile into this cover.
const Cover = ({ project, sizes, priority }: { project: Project; sizes: string; priority?: boolean }) => {
  const thumb = thumbOf(project);
  return thumb ? (
    <ViewTransition name={`cover-${project.slug}`} share="morph" default="none">
      <Image src={thumb} alt={project.title} fill sizes={sizes} priority={priority} unoptimized={thumb.startsWith("https:")} className="object-cover" />
    </ViewTransition>
  ) : (
    <span className={`${label} grid h-full place-items-center text-gray`}>[Add cover]</span>
  );
};

/** The work comes first: the first video (with its poster), else a YouTube facade, else the cover still. */
function Lead({ project }: { project: Project }) {
  const video = project.media.find((m) => m.video);
  if (video)
    return (
      <video src={video.src} poster={posterOf(video.src)} controls playsInline preload="metadata" className="aspect-video w-full bg-ink"></video>
    );
  if (project.youtube?.length) return <YouTube id={project.youtube[0]} title={`${project.title} — video 1`} />;
  return (
    <div className="relative aspect-[3/2] overflow-hidden bg-ink/5">
      <Cover project={project} sizes="100vw" priority />
    </div>
  );
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="grid gap-3 border-t border-line pt-4 md:grid-cols-[12rem_1fr]">
    <RevealText as="h2" className="text-2xl font-extrabold uppercase leading-none tracking-tight">
      {title}
    </RevealText>
    <div className="max-w-prose">{children}</div>
  </section>
);

export default function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <Suspense fallback={null}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

async function CaseStudy({ params }: { params: PageProps<"/work/[slug]">["params"] }) {
  const { slug } = await params;
  const index = workProjects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = workProjects[index];
  const next = workProjects[(index + 1) % workProjects.length];
  const { glance, tier } = project;

  const lead = project.media.find((m) => m.video);
  const rest = project.media.filter((m) => m !== lead);
  const moreVideos = project.youtube?.slice(1) ?? [];

  return (
    <main className="px-gutter py-section">
      <div className={`${label} flex items-center justify-between`}>
        <Link href="/#work" className="inline-flex min-h-11 items-center hover:text-red-text focus-visible:text-red-text">
          ← Portfolio
        </Link>
        <span className="text-gray">
          {num(index)} / {String(workProjects.length).padStart(2, "0")}
        </span>
      </div>

      <header className="mt-8 flex flex-col gap-4">
        <RevealText as="h1" trigger="load" className="text-balance break-words text-display-lg font-extrabold uppercase leading-[0.85] tracking-[-0.04em]">
          {project.title}
        </RevealText>
        <p className="max-w-prose text-lg">{project.summary}</p>
      </header>

      <div className="mt-10">
        <Lead project={project} />
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-4 md:grid-cols-6">
        {[
          ["Client", glance.client],
          ["My role", glance.role],
          ["Team", glance.team],
          ["Format", glance.format],
          ["Tools", glance.tools],
          ["Year", project.year],
        ].map(([name, value]) => (
          <div key={name}>
            <dt className={`${label} text-gray`}>{name}</dt>
            <dd className="mt-1 text-sm">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-section flex flex-col gap-10">
        <Block title="Brief">
          <p>{project.brief}</p>
        </Block>
        {tier === "A" && (
          <>
            <Block title="Decisions">
              <ul className="flex list-disc flex-col gap-2 pl-5">
                {project.decisions.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Block>
            <Block title="Process">
              <p>{project.process}</p>
            </Block>
            <Block title="Result">
              <p>{project.result}</p>
            </Block>
          </>
        )}
        {tier !== "C" && (
          <Block title="What I learned">
            <p>{project.learned}</p>
          </Block>
        )}
      </div>

      {(rest.length > 0 || moreVideos.length > 0) && (
        <section className="mt-section">
          <RevealText as="h2" className="text-display-md font-extrabold uppercase leading-none tracking-[-0.03em]">
            {tier === "A" ? "Deliverables" : "More"}
          </RevealText>
          <ul className="mt-8 columns-1 gap-4 md:columns-2 [&>li]:mb-4 [&>li]:break-inside-avoid">
            {moreVideos.map((id, i) => (
              <li key={id}>
                <YouTube id={id} title={`${project.title} — video ${i + 2}`} />
              </li>
            ))}
            {rest.map((m, i) => (
              <li key={m.src}>
                {m.video ? (
                  <video src={m.src} poster={posterOf(m.src)} controls playsInline preload="metadata" className="aspect-video w-full bg-ink"></video>
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
        </section>
      )}

      <Link href={`/work/${next.slug}`} className="group mt-section flex items-end justify-between gap-6 border-t border-ink pt-6">
        <span>
          <span className={`${label} text-gray`}>Next project</span>
          <span className="mt-2 block text-display-md font-extrabold uppercase leading-none tracking-[-0.03em] transition-colors duration-[var(--duration-fast)] group-hover:text-red-text group-focus-visible:text-red-text">
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
