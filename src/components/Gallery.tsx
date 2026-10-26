"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/projects";
import { gsap, useGSAP, EASE, MOTION_QUERIES } from "@/lib/gsap";
import { whenLoaderDone } from "@/lib/loader";

const COUNT = 24;
const MOBILE_COUNT = 12; // keep in sync with .gallery-tile:nth-of-type in globals.css
const ACCENTS = new Set([5, 17]); // red duotone tiles
const HOLD = 2; // s resting in each layout
const MORPH = 1.2; // s between layouts
const LAYOUTS = ["scatter", "circle", "row"] as const;
type Layout = (typeof LAYOUTS)[number];
type Pose = { x: number; y: number; rotation: number; scale: number };

// Covers repeat to fill every tile.
const covers = projects.filter((p) => p.cover);
const tiles = Array.from({ length: COUNT }, (_, i) => covers[i % covers.length]);

// mulberry32: same seed → same scatter on every visit.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Poses are offsets from the stage centre, in px. */
function layouts(n: number, w: number, h: number, s: number) {
  const rand = rng(7);
  // Jittered grid so the scatter fills the stage without clumping.
  const cols = Math.ceil(Math.sqrt((n * w) / h));
  const rows = Math.ceil(n / cols);
  const scatter: Pose[] = Array.from({ length: n }, (_, i) => ({
    x: (((i % cols) + 0.5 + (rand() - 0.5) * 0.6) / cols - 0.5) * (w - s),
    y: ((Math.floor(i / cols) + 0.5 + (rand() - 0.5) * 0.6) / rows - 0.5) * (h - s * 1.4),
    rotation: (rand() - 0.5) * 16,
    scale: 0.75 + rand() * 0.4,
  }));

  const links: [number, number][] = [];
  const seen = new Set<string>();
  scatter.forEach((p, i) => {
    scatter
      .map((q, j) => [j, Math.hypot(q.x - p.x, q.y - p.y)] as const)
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, rand() < 0.5 ? 1 : 2)
      .forEach(([j]) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        links.push([i, j]);
      });
  });

  const r = Math.min(w, h) * 0.32;
  const circle: Pose[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const deg = (a * 180) / Math.PI + 90;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, rotation: deg > 180 ? deg - 360 : deg, scale: 1 };
  });

  const rowScale = Math.min(1, (w * 0.94) / (n * s));
  const step = s * rowScale;
  const row: Pose[] = Array.from({ length: n }, (_, i) => ({ x: (i - (n - 1) / 2) * step, y: 0, rotation: 0, scale: rowScale }));

  return { scatter, circle, row, links, step };
}

export default function Gallery() {
  const root = useRef<HTMLDivElement>(null);
  const pick = useRef<((name: Layout) => void) | null>(null);
  const toggle = useRef<(() => void) | null>(null);
  const [active, setActive] = useState<Layout>("scatter");
  const [playing, setPlaying] = useState(true);

  useGSAP(
    () => {
      const stage = root.current!;
      const canvas = stage.querySelector("canvas")!;
      const ctx = canvas.getContext("2d")!;
      const ink = getComputedStyle(stage).getPropertyValue("--color-ink").trim();

      gsap.matchMedia().add({ mobile: "(max-width: 767px)", ...MOTION_QUERIES }, (mm) => {
        const { mobile, reduce } = mm.conditions as { mobile: boolean; reduce: boolean };
        const els = gsap.utils.toArray<HTMLElement>(".gallery-tile", stage).slice(0, mobile ? MOBILE_COUNT : COUNT);
        const n = els.length;
        const order: readonly Layout[] = mobile ? ["circle", "row"] : LAYOUTS;
        let current: Layout = reduce ? "row" : order[0];
        let L = layouts(n, 1, 1, 1);
        let w = 0;
        let h = 0;
        const poses: Pose[] = L.row.map((p) => ({ ...p }));
        const mix: Record<Layout, number> = { scatter: 0, circle: 0, row: 0 };
        const xs = new Float32Array(n);
        const ys = new Float32Array(n);
        let morph: gsap.core.Timeline | null = null;
        let auto: gsap.core.Tween | null = null;
        let paused = false; // Pause button or a layout pick holds all motion (WCAG 2.2.2)
        let visible = true;
        let t = 0; // motion clock; stops while paused so drift resumes without a jump
        setPlaying(true);

        const draw = () => {
          const drift = L.step * 0.15 * mix.scatter;
          const waveAt = ((t * 0.3) % 1.6) - 0.3; // sweeps past both ends of the row
          els.forEach((el, i) => {
            const p = poses[i];
            let { x, y, scale } = p;
            let z = 1;
            if (!reduce) {
              x += Math.sin(t * 0.7 + i * 1.7) * drift;
              y += Math.cos(t * 0.6 + i * 2.3) * drift;
              const g = Math.exp(-(((i / (n - 1) - waveAt) / 0.12) ** 2)) * mix.row;
              scale *= 1 + (1.1 * g - 0.3) * mix.row;
              y -= g * L.step * 1.2;
              z += Math.round(g * 50);
            }
            xs[i] = x;
            ys[i] = y;
            el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${p.rotation}deg) scale(${scale})`;
            el.style.zIndex = String(z);
          });

          ctx.clearRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1;
          const lines = (weight: number, path: () => void) => {
            if (weight < 0.01) return;
            ctx.globalAlpha = 0.35 * weight;
            ctx.beginPath();
            path();
            ctx.stroke();
          };
          lines(mix.scatter, () =>
            L.links.forEach(([a, b]) => {
              ctx.moveTo(xs[a], ys[a]);
              ctx.lineTo(xs[b], ys[b]);
            }),
          );
          lines(mix.circle, () =>
            els.forEach((_, i) => {
              ctx.moveTo(xs[i], ys[i]);
              ctx.lineTo(0, 0);
            }),
          );
          lines(mix.row, () =>
            els.forEach((_, i) => {
              ctx.moveTo(xs[i], ys[i]);
              ctx.lineTo(xs[i] * 1.15, h / 2);
            }),
          );
        };

        const goTo = (name: Layout, instant = reduce) => {
          current = name;
          setActive(name);
          morph?.kill();
          const target = L[name];
          const weights = { scatter: +(name === "scatter"), circle: +(name === "circle"), row: +(name === "row") };
          if (instant) {
            poses.forEach((p, i) => Object.assign(p, target[i]));
            Object.assign(mix, weights);
            draw();
            return;
          }
          morph = gsap
            .timeline({ defaults: { duration: MORPH, ease: EASE.inOut } })
            .to(poses, {
              x: (i) => target[i].x,
              y: (i) => target[i].y,
              rotation: (i) => target[i].rotation,
              scale: (i) => target[i].scale,
              stagger: 0.015,
            })
            .to(mix, weights, 0);
        };

        const schedule = () => {
          auto?.kill();
          if (reduce || paused) return;
          auto = gsap.delayedCall(HOLD + MORPH, () => {
            goTo(order[(order.indexOf(current) + 1) % order.length]);
            schedule();
          });
        };

        const measure = () => {
          w = stage.clientWidth;
          h = stage.clientHeight;
          const s = gsap.utils.clamp(40, 88, w * (mobile ? 0.14 : 0.065));
          stage.style.setProperty("--tile", `${s}px`);
          L = layouts(n, w, h, s);
          const dpr = window.devicePixelRatio || 1;
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, (w / 2) * dpr, (h / 2) * dpr);
          goTo(current, true);
        };
        measure();
        stage.dataset.ready = "";

        const setPaused = (value: boolean) => {
          paused = value;
          setPlaying(!value);
          if (value) {
            auto?.kill();
          } else {
            morph?.resume();
            schedule();
          }
        };
        pick.current = (name) => {
          setPaused(true); // a manual choice holds that layout until Play
          goTo(name);
        };
        toggle.current = () => {
          if (!paused) morph?.pause();
          setPaused(!paused);
        };

        // Hold still while a tile has keyboard focus.
        const onFocusIn = () => auto?.pause();
        const onFocusOut = (e: FocusEvent) => {
          if (!paused && !stage.contains(e.relatedTarget as Node)) auto?.resume();
        };
        stage.addEventListener("focusin", onFocusIn);
        stage.addEventListener("focusout", onFocusOut);

        const ro = new ResizeObserver(measure);
        ro.observe(stage);
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(stage);
        const tick = (_: number, dt: number) => {
          if (!paused) t += dt / 1000;
          if (visible && (!paused || morph?.isActive())) draw();
        };
        if (!reduce) gsap.ticker.add(tick);
        const stopWaiting = whenLoaderDone(schedule);

        return () => {
          pick.current = null;
          toggle.current = null;
          stopWaiting();
          auto?.kill();
          morph?.kill();
          gsap.ticker.remove(tick);
          ro.disconnect();
          io.disconnect();
          stage.removeEventListener("focusin", onFocusIn);
          stage.removeEventListener("focusout", onFocusOut);
        };
      });
    },
    { scope: root },
  );

  return (
    <div className="flex flex-col gap-4">
      <div ref={root} className="gallery">
        {tiles.map((p, i) => (
          <Link key={i} href={`/work/${p.slug}`} className="gallery-tile">
            <Image src={p.cover!} alt={p.title} fill sizes="96px" loading="eager" className="object-cover" />
            {ACCENTS.has(i) && <span className="gallery-accent" aria-hidden="true" />}
          </Link>
        ))}
        <canvas aria-hidden="true" />
      </div>
      <div role="group" aria-label="Gallery layout" className="gallery-controls flex gap-2 self-center">
        {LAYOUTS.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={active === name}
            onClick={() => pick.current?.(name)}
            className={`border border-ink px-3 py-1.5 text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper ${name === "scatter" ? "max-md:hidden" : ""}`}
          >
            {name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => toggle.current?.()}
          className="border border-ink px-3 py-1.5 text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)] hover:border-red hover:text-red motion-reduce:hidden"
        >
          {playing ? "Pause" : "Play"}
          <span className="sr-only"> gallery motion</span>
        </button>
      </div>
    </div>
  );
}
