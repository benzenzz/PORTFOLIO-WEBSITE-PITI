"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects, imageSize, type Project } from "@/content/projects";
import { filled } from "@/content/site";
import { gsap, useGSAP, DURATION, EASE, MOTION_QUERIES } from "@/lib/gsap";

const STEP = 60; // svh of scroll per project while the stage is pinned (desktop)

const items = projects.filter((p) => p.cover ?? p.poster);
const imageOf = (p: Project) => (p.cover ?? p.poster)!;
const videoOf = (p: Project) => p.media.find((m) => m.video)?.src;
const pad = (n: number) => String(n).padStart(2, "0");

// Only facts we hold: placeholders stay hidden, the file count is derived from the media list.
const metaOf = (p: Project) =>
  [
    ["Category", p.category],
    ["Year", p.year],
    ["Role", p.role],
    [p.media[0]?.video ? "Videos" : "Images", pad(p.media.length)],
  ].filter(([, value]) => filled(value));

const label = "font-mono text-xs uppercase tracking-widest text-gray-on-ink";
const heading = "font-extrabold uppercase leading-[0.9] tracking-tight text-[length:clamp(1.75rem,1rem+2.2vw,3.25rem)]";
const textLink =
  "inline-flex min-h-11 items-center border-b border-paper text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red";

/** Natural scroll drives the stage: the slice of the pinned track crossing the viewport centre is the active project. */
export default function SelectedWork() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const previous = useRef(0);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  useEffect(() => {
    const steps = root.current!.querySelectorAll<HTMLElement>("[data-step]");
    // Events only say "something crossed the centre line"; the answer is recomputed from geometry so a jump
    // (focus, End key, anchor) past the track still resolves to the first/last project instead of going stale.
    const io = new IntersectionObserver(
      () => {
        const mid = window.innerHeight / 2;
        const i = [...steps].findIndex((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= mid && r.bottom > mid;
        });
        setActive(i >= 0 ? i : steps[0].getBoundingClientRect().top > mid ? 0 : steps.length - 1);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    steps.forEach((el) => io.observe(el));
    // Videos only run while the stage is on screen.
    const vis = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    vis.observe(stage.current!);
    return () => {
      io.disconnect();
      vis.disconnect();
    };
  }, []);

  // One video at a time: only the active project's plays, and never by itself under reduced motion.
  useEffect(() => {
    const reduce = window.matchMedia(MOTION_QUERIES.reduce).matches;
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && inView && !reduce) v.play().catch(() => {});
      else if (!v.paused || v.currentTime > 0) {
        v.pause();
        v.load(); // back to the poster frame
      }
    });
  }, [active, inView]);
  useEffect(() => () => videos.current.forEach((v) => v?.pause()), []);

  const toggle = (i: number) => {
    const v = videos.current[i];
    if (v) void (v.paused ? v.play().catch(() => {}) : v.pause());
  };

  useGSAP(
    () => {
      const from = previous.current;
      previous.current = active;
      if (from === active) return;

      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      // Reduced motion: no branch matches, CSS swaps the active item instantly.
      mm.add(MOTION_QUERIES.motion, () => {
        const clear = "opacity,visibility,transform,clipPath,filter,zIndex";
        // Drop leftovers from an interrupted hand-over, keeping the outgoing item on screen.
        q("[data-img],[data-meta],[data-counter]").forEach((el) => {
          const i = Number((el as HTMLElement).dataset.img ?? (el as HTMLElement).dataset.meta ?? -1);
          if (i !== from && i !== active) gsap.set(el, { clearProps: clear });
        });
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        tl.fromTo(q(`[data-img="${from}"]`), { autoAlpha: 1, scale: 1, zIndex: 0 }, { autoAlpha: 0, scale: 0.96, duration: DURATION.slow, clearProps: clear }, 0)
          .fromTo(q(`[data-img="${active}"]`), { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08, zIndex: 1 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: DURATION.slow, clearProps: clear }, 0)
          .fromTo(q(`[data-meta="${from}"]`), { autoAlpha: 1, filter: "blur(0px)" }, { autoAlpha: 0, filter: "blur(6px)", duration: DURATION.fast, clearProps: clear }, 0)
          .fromTo(q(`[data-meta="${active}"]`), { autoAlpha: 0, filter: "blur(6px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: DURATION.base, clearProps: clear }, DURATION.fast)
          .fromTo(q("[data-counter]"), { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: DURATION.base, clearProps: clear }, 0);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [active] },
  );

  const goTo = (i: number) => {
    const r = root.current!.querySelector(`[data-step="${i}"]`)!.getBoundingClientRect();
    const reduce = window.matchMedia(MOTION_QUERIES.reduce).matches;
    window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2 + 1, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section id="work" ref={root} aria-label="Selected work" data-surface="ink" className="grain bg-ink text-paper">
      {/* Deliberate edge between the paper hero and the ink stage. */}
      <div aria-hidden className={`${label} relative flex justify-between border-b border-paper/15 px-gutter py-3`}>
        <span>(02) Selected work · Index 01—{pad(items.length)}</span>
        <span className="max-lg:hidden">Scroll to browse ↓</span>
      </div>

      {/* Desktop: pinned stage. The invisible steps only measure scroll position. */}
      <div ref={stage} className="relative hidden lg:block" style={{ height: `${items.length * STEP + 100}svh` }}>
        {/* Pinned scroll = items × STEP; the track starts half a viewport down so each project gets a full STEP while pinned. */}
        <div aria-hidden className="absolute inset-x-0 top-[50svh]">
          {items.map((p, i) => (
            <div key={p.slug} data-step={i} style={{ height: `${STEP}svh` }} />
          ))}
        </div>

        {/* Overlaid in one row so DOM order = tab order (index → Pause → Open) while the layout stays three columns. */}
        <div className="sticky top-0 grid h-svh grid-cols-12 grid-rows-1 gap-x-[var(--space-gutter)] px-gutter pb-gutter pt-20">
          <h2 className={`${heading} col-span-3 col-start-1 row-start-1 self-start`}>
            Selected
            <br />
            work
          </h2>

          {/* object-contain: posters carry type, so they are never cropped. Media gets no grain, tint or blur at rest. */}
          <div className="relative col-span-7 col-start-4 row-start-1 overflow-hidden">
            {items.map((p, i) => {
              const video = videoOf(p);
              return (
                <Link
                  key={p.slug}
                  href={`/work/${p.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  data-img={i}
                  data-active={i === active || undefined}
                  className="stage-item absolute inset-0"
                >
                  {video ? (
                    <video
                      ref={(el) => {
                        videos.current[i] = el;
                      }}
                      src={video}
                      poster={imageOf(p)}
                      muted
                      loop
                      playsInline
                      preload="none"
                      onPlay={() => setPlayingIdx(i)}
                      onPause={() => setPlayingIdx((c) => (c === i ? null : c))}
                      className="absolute inset-0 size-full object-contain"
                    />
                  ) : (
                    <Image src={imageOf(p)} alt={`${p.title} — project cover`} fill sizes="60vw" priority={i === 0} className="object-contain" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Selecting only changes the active project; opening a case study is the separate link below. */}
          <div role="group" aria-label="Choose project" className="col-span-2 col-start-11 row-start-1 flex flex-col justify-center">
            <ol>
              {items.map((p, i) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "true" : undefined}
                    data-on={i === active || undefined}
                    className="group flex min-h-11 w-full items-baseline gap-2 border-l-2 border-transparent py-1.5 pl-3 text-left text-sm font-bold leading-snug xl:text-base tracking-tight text-gray-on-ink transition-colors duration-[var(--duration-fast)] hover:text-paper focus-visible:text-paper data-[on]:border-red data-[on]:text-paper"
                  >
                    <span aria-hidden className={`${label} text-[0.6875rem] tabular-nums`}>
                      {pad(i + 1)}
                    </span>
                    <span>{p.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="col-span-3 col-start-1 row-start-1 flex flex-col self-end">
            <div className="overflow-hidden">
              <div className="flex items-baseline gap-3">
                <span data-counter aria-hidden className="font-display text-[length:clamp(3rem,1.5rem+4vw,5.5rem)] leading-none">
                  {pad(active + 1)}
                </span>
                <span aria-hidden className={label}>
                  <span className="text-red">/</span> {pad(items.length)}
                </span>
              </div>
            </div>
            <div className="mt-6 grid">
              {items.map((p, i) => (
                <div key={p.slug} data-meta={i} data-active={i === active || undefined} className="stage-item [grid-area:1/1]">
                  <h3 className="text-lg font-extrabold leading-tight tracking-tight">{p.title}</h3>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                    {metaOf(p).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className={label}>{k}</dt>
                        <dd className="text-sm">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6">
                    {videoOf(p) && (
                      <button type="button" onClick={() => toggle(i)} className={textLink}>
                        {playingIdx === i ? "Pause video" : "Play video"}
                      </button>
                    )}
                    <Link href={`/work/${p.slug}`} aria-label={`Open project: ${p.title}`} className={textLink}>
                      Open project →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Touch / narrow: plain stacked cards, all text visible without hover. Posters only; no autoplay. */}
      <div className="relative px-gutter py-section lg:hidden">
        <h2 className={heading}>Selected work</h2>
        <ol className="mt-10 flex flex-col gap-12 md:grid md:grid-cols-2 md:gap-x-[var(--space-gutter)] md:gap-y-16">
          {items.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}`} className="block">
                <Image
                  src={imageOf(p)}
                  alt={`${p.title} — project cover`}
                  width={imageSize[p.slug][0]}
                  height={imageSize[p.slug][1]}
                  sizes="100vw"
                  className="h-auto w-full"
                />
                <p className={`${label} mt-4`}>
                  {pad(i + 1)} <span className="text-red">/</span> {pad(items.length)} • {p.category}
                </p>
                <h3 className="mt-2 text-lg font-extrabold leading-tight tracking-tight">{p.title}</h3>
                <p className="mt-3 inline-flex min-h-11 items-center border-b border-paper text-xs uppercase tracking-widest">Open project →</p>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className={`${label} relative flex justify-end border-t border-paper/15 px-gutter`}>
        <a href="#about" className="inline-flex min-h-11 items-center transition-colors duration-[var(--duration-fast)] hover:text-red">
          About ↓
        </a>
      </div>
    </section>
  );
}
