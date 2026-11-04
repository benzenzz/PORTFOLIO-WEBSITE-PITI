"use client";

// Prototype only (/lab/space). Mirrors SelectedWork's arming, fallback and archive so the two can be compared at equal footing.
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { featured, imageSize, spaceThumbs, type Project } from "@/content/projects";
import { gsap, useGSAP, ScrollTrigger, MOTION_QUERIES } from "@/lib/gsap";
import { lenis } from "@/components/SmoothScroll";
import type { LabLayout, LabMode, LabPanel, LabSpace } from "@/lib/space-lab";

const items = featured.filter((p) => p.cover ?? p.poster);
const n = items.length;
const imageOf = (p: Project) => (p.cover ?? p.poster)!;
const pad = (n: number) => String(n).padStart(2, "0");
const countOf = (p: Project) => `${pad(p.media.length)} ${p.media[0]?.video ? "videos" : "images"}`;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const END = 0.1; // last share of the pin: the space dims while the archive comes up
const MODES = {
  desktop: { cover: 828, thumb: 384, thumbs: 4 },
  tablet: { cover: 828, thumb: 384, thumbs: 2 },
  mobile: { cover: 640, thumb: 256, thumbs: 1 },
};
const optimised = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
// Each project's cover, then its approved stills (each file once). Video projects have no approved stills, so only their poster.
const labPanels = (mode: LabMode): LabPanel[] =>
  items.flatMap((p, k) => {
    const [w, h] = imageSize[p.slug];
    const m = MODES[mode];
    const stills = spaceThumbs.filter((t) => t.slug === p.slug).slice(0, m.thumbs);
    return [
      { src: optimised(imageOf(p), m.cover), ratio: h / w, project: k, cover: true },
      ...stills.flatMap((t) => {
        const media = p.media.find((x) => x.src === t.src);
        return media?.width && media.height ? [{ src: optimised(t.src, m.thumb), ratio: media.height / media.width, project: k, cover: false }] : [];
      }),
    ];
  });

const label = "font-mono text-xs uppercase tracking-widest text-gray-on-ink";
const textLink =
  "inline-flex min-h-11 items-center border-b border-paper text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)]";
const hoverLink = "transition-colors duration-[var(--duration-fast)] hover:text-red";

export default function SpaceLab() {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const [layout, setLayout] = useState<LabLayout>("rings");
  const ctl = useRef<{ preview(i: number | null): void; layout(l: LabLayout): void } | null>(null);
  const hoverTimer = useRef(0);

  useGSAP(
    () => {
      const section = root.current!;
      const track = section.querySelector<HTMLElement>(".lab-track")!;
      const spacer = section.querySelector<HTMLElement>(".lab-spacer")!;
      const stage = section.querySelector<HTMLElement>(".lab-stage")!;
      const host = section.querySelector<HTMLElement>(".lab-canvas")!;
      const pill = section.querySelector<HTMLElement>(".lab-pill")!;
      let chosen: LabLayout = new URLSearchParams(location.search).get("layout") === "spiral" ? "spiral" : "rings";
      setLayout(chosen);

      gsap.matchMedia().add(
        {
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 768px) and (max-width: 1023px)",
          mobile: "(min-width: 360px) and (max-width: 767px)",
          motion: MOTION_QUERIES.motion,
        },
        (context) => {
          const { desktop, tablet, mobile, motion } = context.conditions!;
          if (!motion || !(desktop || tablet || mobile) || !("WebGLRenderingContext" in window)) return;
          const mode: LabMode = desktop ? "desktop" : tablet ? "tablet" : "mobile";
          const panels = labPanels(mode);

          let space: LabSpace | null = null;
          let killed = false;
          let p = 0;
          let shown = 0;
          let previewing = false;

          const sync = () => {
            const t = clamp01(p / (1 - END)) * (n - 1);
            space?.update(t);
            host.style.opacity = String(1 - 0.75 * clamp01((p - (1 - END)) / END));
            const c = Math.round(t);
            if (c !== shown) setCurrent((shown = c));
          };
          const setPreviewIdx = (i: number | null) => {
            previewing = i !== null;
            space?.preview(i);
            setPreview(i);
          };

          section.dataset.armed = "";
          const st = ScrollTrigger.create({
            trigger: track,
            start: "top top",
            end: () => "+=" + spacer.offsetHeight,
            onUpdate: (self) => {
              p = self.progress;
              if (previewing) setPreviewIdx(null);
              sync();
            },
            onRefresh: (self) => {
              p = self.progress;
              space?.resize();
              sync();
            },
          });
          const tick = (_: number, dt: number) => space?.frame(Math.min(dt, 100) / 1000);
          const visible = ScrollTrigger.create({
            trigger: track,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
          });
          if (visible.isActive) gsap.ticker.add(tick);

          const scrollToStop = (i: number) => {
            const y = st.start + (st.end - st.start) * (i / (n - 1)) * (1 - END);
            if (lenis) lenis.scrollTo(y, { duration: 1.2 });
            else window.scrollTo({ top: y, behavior: "smooth" });
          };

          // Hover: the panel leans toward the camera and a label names its project (stills name the project they come from).
          const onMove = (e: PointerEvent) => {
            if (!space || e.pointerType !== "mouse") return;
            const r = host.getBoundingClientRect();
            space.pointer(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
            const i = e.target instanceof HTMLCanvasElement ? space.pick(e.clientX, e.clientY) : null;
            space.hover(i);
            host.style.cursor = i === null ? "" : "pointer";
            if (i === null) return void (pill.hidden = true);
            const proj = items[panels[i].project];
            pill.hidden = false;
            pill.firstElementChild!.textContent = proj.title;
            pill.lastElementChild!.textContent = panels[i].cover ? proj.category : `Still · ${proj.category}`;
            pill.style.transform = `translate(${e.clientX - r.left + 18}px, ${e.clientY - r.top + 18}px)`;
          };
          const onLeave = () => {
            space?.pointer(0, 0);
            space?.hover(null);
            pill.hidden = true;
          };
          const onClick = (e: MouseEvent) => {
            if (!space || !(e.target instanceof HTMLCanvasElement)) return;
            const i = space.pick(e.clientX, e.clientY);
            if (i === null) return;
            const k = panels[i].project;
            if (k === shown) router.push(`/work/${items[k].slug}`);
            else scrollToStop(k);
          };
          const onKey = (e: KeyboardEvent) => e.key === "Escape" && previewing && setPreviewIdx(null);
          stage.addEventListener("pointermove", onMove);
          stage.addEventListener("pointerleave", onLeave);
          stage.addEventListener("click", onClick);
          section.addEventListener("keydown", onKey);
          ctl.current = {
            preview: setPreviewIdx,
            layout: (l) => {
              chosen = l;
              space?.layout(l);
            },
          };

          // shortcut: no scroll compensation when disarming mid-page (production SelectedWork has it); add it if this replaces production.
          const teardown = () => {
            if (killed) return;
            killed = true;
            [st, visible, load].forEach((t) => t.kill());
            gsap.ticker.remove(tick);
            stage.removeEventListener("pointermove", onMove);
            stage.removeEventListener("pointerleave", onLeave);
            stage.removeEventListener("click", onClick);
            section.removeEventListener("keydown", onKey);
            space?.dispose();
            space = null;
            ctl.current = null;
            setPreview(null);
            delete section.dataset.armed;
            delete section.dataset.ready;
          };
          const fail = () => {
            if (killed) return;
            teardown();
            ScrollTrigger.refresh();
          };
          const load = ScrollTrigger.create({
            trigger: track,
            start: "top bottom+=100%",
            once: true,
            onEnter: () => {
              import("@/lib/space-lab")
                .then(({ createLabSpace }) => {
                  if (killed) return;
                  space = createLabSpace(host, panels, mode, chosen, fail, () => (section.dataset.ready = ""));
                  sync();
                })
                .catch(fail);
            },
          });
          ScrollTrigger.refresh();
          return teardown;
        },
      );
    },
    { scope: root },
  );

  const choose = (l: LabLayout) => {
    setLayout(l);
    ctl.current?.layout(l);
    history.replaceState(null, "", `?layout=${l}`);
  };
  const shownIdx = preview ?? current;
  const sp = items[shownIdx];

  return (
    <section
      ref={root}
      aria-label="Selected work — spatial prototype"
      data-surface="ink"
      className="group/lab grain bg-ink text-paper [--grain:0.07] [--lab-stop:42svh] md:[--lab-stop:48svh] lg:[--lab-stop:55svh]"
    >
      <div className="lab-track relative">
        <div className="lab-stage sticky top-0 hidden h-svh overflow-hidden group-data-[armed]/lab:block">
          <div aria-hidden className="lab-canvas absolute inset-0" />
          <p aria-hidden className="lab-pill pointer-events-none absolute left-0 top-0 border border-paper/25 bg-ink/85 px-3 py-2" hidden>
            <span className="block text-sm font-semibold" />
            <span className={`block ${label}`} />
          </p>

          <div className={`${label} absolute inset-x-0 top-0 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-gutter pb-3 pt-14`}>
            <span className="whitespace-nowrap">
              <span className="max-sm:hidden">
                Prototype <span className="text-red">·</span>{" "}
              </span>
              {pad(shownIdx + 1)} / {pad(n)}
            </span>
            <span role="group" aria-label="Layout" className="flex border border-paper/25">
              {(["rings", "spiral"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={layout === l}
                  onClick={() => choose(l)}
                  className={`min-h-11 px-4 uppercase tracking-widest ${layout === l ? "bg-paper text-ink" : `text-paper ${hoverLink}`}`}
                >
                  {l}
                </button>
              ))}
            </span>
            <a href="#lab-index" className={`justify-self-end whitespace-nowrap ${hoverLink}`}>
              Index ↓
            </a>
          </div>

          <nav aria-label="Project index" className="absolute left-gutter top-28 max-md:hidden md:w-[26%]">
            <ol className="flex flex-col">
              {items.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/work/${p.slug}`}
                    onMouseEnter={() => {
                      clearTimeout(hoverTimer.current);
                      hoverTimer.current = window.setTimeout(() => ctl.current?.preview(i), 120);
                    }}
                    onMouseLeave={() => {
                      clearTimeout(hoverTimer.current);
                      ctl.current?.preview(null);
                    }}
                    onFocus={(e) => e.currentTarget.matches(":focus-visible") && ctl.current?.preview(i)}
                    onBlur={() => ctl.current?.preview(null)}
                    className={`flex min-h-11 items-center gap-3 text-sm ${i === shownIdx ? "text-paper" : "text-gray-on-ink"} ${hoverLink}`}
                  >
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <span aria-hidden className={`size-1.5 bg-red ${i === shownIdx ? "" : "opacity-0"}`} />
                      {pad(i + 1)}
                    </span>
                    {p.title}
                    <span className="sr-only"> — open project</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="absolute inset-x-0 bottom-0 bg-ink px-gutter pb-6 pt-4 md:right-auto md:w-[34%] md:bg-transparent md:pb-12">
            <div aria-hidden className="grid">
              {items.map((p, i) => (
                <div key={p.slug} className={`self-end [grid-area:1/1] ${i === shownIdx ? "" : "invisible"}`}>
                  <p className={label}>
                    {pad(i + 1)} / {pad(n)} · {p.category} · {countOf(p)}
                  </p>
                  <p className="mt-3 font-extrabold uppercase leading-[0.9] tracking-tight text-[length:clamp(1.75rem,1rem+2.6vw,3.75rem)]">{p.title}</p>
                </div>
              ))}
            </div>
            <Link href={`/work/${sp.slug}`} className={`${textLink} mt-4 hover:border-red hover:text-red md:hidden`}>
              Open {sp.title} →
            </Link>
          </div>
        </div>
        <div aria-hidden className="lab-spacer hidden group-data-[armed]/lab:block" style={{ height: `calc(var(--lab-stop) * ${n})` }} />
      </div>

      <div id="lab-index" className="relative scroll-mt-11 px-gutter pb-section pt-14 md:pt-24">
        <h2 className="font-extrabold uppercase leading-[0.9] tracking-tight text-[length:clamp(1.75rem,1rem+2.2vw,3.25rem)]">
          Selected
          <br />
          work
        </h2>
        <ol className="mt-8 border-t border-paper/15 md:mt-12">
          {items.map((p, i) => {
            const [w, h] = imageSize[p.slug];
            return (
              <li key={p.slug} className="border-b border-paper/15">
                <Link href={`/work/${p.slug}`} aria-label={`Open project: ${p.title}`} className="group grid gap-4 py-8 md:grid-cols-12 md:gap-6 md:py-12">
                  <span className={`${label} md:col-span-1`}>{pad(i + 1)}</span>
                  <span className="flex flex-col md:col-span-5">
                    <span className="font-extrabold uppercase leading-[0.95] tracking-tight text-[length:clamp(1.5rem,1rem+1.6vw,2.5rem)] group-hover:text-red">
                      {p.title}
                    </span>
                    <span className={`${label} mt-3`}>
                      {p.category} · {countOf(p)}
                    </span>
                  </span>
                  <span className="md:col-span-6">
                    <Image src={imageOf(p)} alt={`${p.title} — project cover`} width={w} height={h} sizes="(min-width: 768px) 50vw, 100vw" className="block h-auto max-h-[70svh] w-auto max-w-full md:ml-auto" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
