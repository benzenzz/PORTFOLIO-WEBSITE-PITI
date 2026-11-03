"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoopVideo from "@/components/LoopVideo";
import { GROUPS, thumbOf, workProjects, type Project } from "@/content/projects";

type Filter = "all" | keyof typeof GROUPS;
const FILTERS: [Filter, string][] = [["all", "All"], ...(Object.entries(GROUPS) as [Filter, string][])];
const FEATURED = 3;

const num = (i: number) => String(i + 1).padStart(2, "0");
const meta = (p: Project) => [p.tags.join(" · "), p.year].join(" · ");
const label = "text-xs uppercase tracking-widest";

function Media({ project, sizes, className }: { project: Project; sizes: string; className: string }) {
  const thumb = thumbOf(project);
  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {thumb ? (
        <Image src={thumb} alt="" fill sizes={sizes} unoptimized={thumb.startsWith("https:")} className="work-media object-cover" />
      ) : (
        <span className={`${label} absolute inset-0 grid place-items-center text-paper/70`}>[Add cover]</span>
      )}
      {project.preview && <LoopVideo src={project.preview} poster={thumb ?? undefined} className="work-media absolute inset-0 h-full w-full object-cover" />}
    </div>
  );
}

function Featured({ project, index, big }: { project: Project; index: number; big?: boolean }) {
  return (
    <Link href={`/work/${project.slug}`} className="work-tile group flex flex-col gap-3">
      <Media project={project} sizes={big ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 100vw"} className={big ? "aspect-[16/10]" : "aspect-video"} />
      <div className="flex items-baseline gap-4">
        <span className={`${label} text-gray`}>{num(index)}</span>
        <div className="flex flex-col gap-1">
          <h3 className={`font-display uppercase leading-none transition-colors duration-[var(--duration-fast)] group-hover:text-red group-focus-visible:text-red ${big ? "text-4xl md:text-5xl" : "text-3xl"}`}>
            {project.title}
          </h3>
          <p className={`${label} text-gray`}>{meta(project)}</p>
          <p className="max-w-prose text-sm">{project.summary}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Work() {
  const [filter, setFilter] = useState<Filter>("all");
  const list = workProjects.filter((p) => filter === "all" || p.group === filter);
  const [first, ...side] = list.slice(0, FEATURED);
  const rest = list.slice(FEATURED);

  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-16 px-gutter py-section">
      <h2 id="work-title" className="portfolio-title">
        <span aria-hidden="true" className="portfolio-title-ghost">
          Portfolio
        </span>
        Portfolio
      </h2>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-3">
        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
          {FILTERS.map(([key, name]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`${label} border border-ink px-3 py-1.5 transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red aria-pressed:border-red aria-pressed:bg-red aria-pressed:text-paper`}
            >
              {name}
            </button>
          ))}
        </div>
        <p className={`${label} text-gray`} aria-live="polite">
          {String(list.length).padStart(2, "0")} projects
        </p>
      </div>

      {first && (
        <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Featured project={first} index={0} big />
          </div>
          {side.length > 0 && (
            <div className="flex flex-col gap-12 md:col-span-5">
              {side.map((p, i) => (
                <Featured key={p.slug} project={p} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {rest.length > 0 && (
        <ul className="mt-section border-t border-line">
          {rest.map((p, i) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                href={`/work/${p.slug}`}
                className="work-row group grid grid-cols-[2rem_6rem_1fr_auto] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-[3rem_10rem_1fr_12rem_3rem] md:gap-x-6"
              >
                <span className={`${label} text-gray`}>{num(i + FEATURED)}</span>
                <Media project={p} sizes="160px" className="aspect-video" />
                <span className="flex flex-col gap-1">
                  <span className="work-row-title font-display text-3xl uppercase leading-none md:text-display-md">{p.title}</span>
                  <span className={`${label} text-gray md:hidden`}>{meta(p)}</span>
                </span>
                <span className={`${label} text-gray max-md:hidden`}>{meta(p)}</span>
                <span aria-hidden="true" className="text-2xl transition-colors duration-[var(--duration-fast)] group-hover:text-red group-focus-visible:text-red">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
