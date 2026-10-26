import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/content/projects";

// Temporary project page so gallery links resolve; the full case study comes in a later phase.
// Every slug is prerendered via generateStaticParams; this only silences the dev "params outside <Suspense>" check.
export const instant = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="px-gutter py-section">
      <Link href="/#work" className="text-xs uppercase tracking-widest hover:text-red">
        ← All work
      </Link>
      <h1 className="mt-8 font-display text-display-lg uppercase leading-[0.92]">{project.title}</h1>
      <p className="mt-6 text-xs uppercase tracking-widest text-gray">
        {project.category} · {project.year} · {project.role}
      </p>
      <p className="mt-8 max-w-prose">{project.description}</p>
    </main>
  );
}
