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
const label = "font-mono text-xs uppercase tracking-widest";
const pad = (n: number) => String(n).padStart(2, "0");

function Media({ project, sizes, className }: { project: Project; sizes: string; className: string }) {
  const thumb = thumbOf(project);
  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {thumb ? (
        <Image src={thumb} alt="" fill sizes={sizes} unoptimized={thumb.startsWith("https:")} className="work-media object-cover" />
      ) : (
        <span className={`${label} absolute inset-0 grid place-items-center text-gray-on-ink`}>[Add cover]</span>
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
        <span className={`${label} text-gray-on-ink`}>{num(index)}</span>
        <div className="flex flex-col gap-1">
          <h3 className={`font-extrabold uppercase leading-[0.9] tracking-tight transition-colors duration-[var(--duration-fast)] group-hover:text-red group-focus-visible:text-red ${big ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
            {project.title}
          </h3>
          <p className={`${label} text-gray-on-ink`}>{meta(project)}</p>
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
    <section id="work" aria-labelledby="work-title" data-surface="ink" className="grain scroll-mt-11 bg-ink px-gutter py-section text-paper">
      <div aria-hidden className={`${label} flex justify-between gap-6 border-b border-paper/15 pb-3 text-gray-on-ink`}>
        <span>(02) Work</span>
        <span>Video → VFX → Design</span>
      </div>
      <h2 id="work-title" className="portfolio-title mt-12">
        <span aria-hidden="true" className="portfolio-title-ghost">
          Portfolio
        </span>
        Portfolio<span className="text-red">.</span>
      </h2>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-paper/15 py-3">
        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
          {FILTERS.map(([key, name]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`${label} inline-flex min-h-11 items-center border border-paper/40 px-3 transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red aria-pressed:border-red aria-pressed:bg-red aria-pressed:text-ink`}
            >
              {name}
            </button>
          ))}
        </div>
        <p className={`${label} text-gray-on-ink`} aria-live="polite">
          {pad(list.length)} projects
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
        <ul className="mt-section border-t border-paper/15">
          {rest.map((p, i) => (
            <li key={p.slug} className="border-b border-paper/15">
              <Link
                href={`/work/${p.slug}`}
                className="work-row group grid grid-cols-[2rem_6rem_1fr_auto] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-[3rem_10rem_1fr_12rem_3rem] md:gap-x-6"
              >
                <span className={`${label} text-gray-on-ink`}>{num(i + FEATURED)}</span>
                <Media project={p} sizes="160px" className="aspect-video" />
                <span className="flex flex-col gap-1">
                  <span className="work-row-title text-2xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-4xl">{p.title}</span>
                  <span className={`${label} text-gray-on-ink md:hidden`}>{meta(p)}</span>
                </span>
                <span className={`${label} text-gray-on-ink max-md:hidden`}>{meta(p)}</span>
                <span aria-hidden="true" className="text-2xl transition-colors duration-[var(--duration-fast)] group-hover:text-red group-focus-visible:text-red">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className={`${label} mt-10 text-gray-on-ink`}>
        More experiments in{" "}
        <Link href="/playground" className="inline-flex min-h-11 items-center border-b border-paper text-paper transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red">
          Playground →
        </Link>
      </p>
    </section>
  );
}
