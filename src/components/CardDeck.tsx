"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/projects";
import { gsap, ScrollTrigger, useGSAP, DURATION, EASE, MOTION_QUERIES } from "@/lib/gsap";
import { LOADER_TIMING, introOn } from "@/lib/loader";

// Keep in sync with .deck-ring in globals.css: radius = card width × count × RADIUS,
// ring pushed back by OFFSET × radius and lifted by LIFT × radius.
const RADIUS = 0.26;
const OFFSET = 0.35;
const LIFT = 0.3;
const BASE_SPEED = 8; // deg/s idle spin
const DEG = Math.PI / 180;

/**
 * CSS draws the resting 3D ring (and a plain grid when scripting is off).
 * JS adds the first-visit intro (stack → fan → ring, timed with the loader) and the spin.
 */
export default function CardDeck() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = root.current!;
      const spinEl = stage.querySelector<HTMLElement>(".deck-spin")!;
      // Cards past the mobile limit are display:none.
      const cards = gsap.utils.toArray<HTMLElement>(".deck-card", stage).filter((c) => c.offsetParent);
      const n = cards.length;
      const angleOf = (i: number) => ((i - (n - 1) / 2) * 360) / n;
      const spin = { a: 0, boost: 0 };
      const setRot = gsap.quickSetter(spinEl, "rotationY", "deg");
      let paused = false;

      gsap.matchMedia().add({ motion: MOTION_QUERIES.motion, reduce: MOTION_QUERIES.reduce }, (ctx) => {
        const reduce = Boolean(ctx.conditions?.reduce);

        // Keyboard focus turns the focused card to the front so its focus ring is visible.
        const onFocus = (e: FocusEvent) => {
          const i = cards.indexOf((e.target as HTMLElement).closest<HTMLElement>(".deck-card")!);
          if (i < 0) return;
          paused = true;
          const off = ((((spin.a + angleOf(i)) % 360) + 540) % 360) - 180;
          gsap.to(spin, {
            a: spin.a - off,
            duration: reduce ? 0 : DURATION.slow,
            ease: EASE.out,
            overwrite: true,
            onUpdate: () => setRot(spin.a),
          });
        };
        const onBlur = () => {
          paused = false;
          gsap.killTweensOf(spin);
        };
        stage.addEventListener("focusin", onFocus);
        stage.addEventListener("focusout", onBlur);
        const removeListeners = () => {
          stage.removeEventListener("focusin", onFocus);
          stage.removeEventListener("focusout", onBlur);
        };
        if (reduce) return removeListeners;

        let spinning = false;
        const st = ScrollTrigger.create({
          trigger: stage,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            spin.boost = Math.min(Math.abs(self.getVelocity()) / 30, 120);
          },
        });
        const tick = (_time: number, dt: number) => {
          if (!spinning || paused || !st.isActive) return;
          spin.a -= ((BASE_SPEED + spin.boost) * dt) / 1000;
          spin.boost *= Math.pow(0.95, dt / 16.7); // eases back to idle in ~1s
          setRot(spin.a);
        };
        gsap.ticker.add(tick);

        if (introOn()) {
          const R = cards[0].offsetWidth * n * RADIUS;
          const vh = window.innerHeight;
          const box = stage.getBoundingClientRect();
          const lift = R * LIFT; // undo the ring's lift while stacked/fanned
          const toCenter = vh / 2 - (box.top + box.height / 2) + lift; // the stack sits mid-screen, the fan in the stage
          const A = Math.min(stage.offsetWidth * 0.3, 420); // fan arc radius
          const fan = (i: number) => (n > 1 ? -70 + (140 * i) / (n - 1) : 0);
          const { count } = LOADER_TIMING;

          // a: deck flies up while the loader counts; b: fans into an arc at 100; c: becomes the ring. Ends ≈2.46s.
          gsap
            .timeline({ onComplete: () => void (spinning = true) })
            .set(cards, { x: 0, y: toCenter + vh, z: R * OFFSET, rotationY: 0, rotation: 0, willChange: "transform" })
            .set(stage, { visibility: "visible" })
            .to(
              cards,
              {
                x: () => gsap.utils.random(-14, 14),
                y: () => toCenter + gsap.utils.random(-10, 10),
                rotation: () => gsap.utils.random(-7, 7),
                duration: 0.9,
                ease: EASE.out,
                stagger: 0.03,
              },
              0.05,
            )
            .to(
              cards,
              {
                x: (i) => A * Math.sin(fan(i) * DEG),
                y: (i) => lift + A * (0.7 - Math.cos(fan(i) * DEG)),
                rotation: fan,
                duration: 0.5,
                ease: EASE.inOut,
              },
              count,
            )
            .to(
              cards,
              {
                // Same pose as the CSS rotateY(θ) translateZ(R), expressed in GSAP's translate-then-rotate order.
                x: (i) => R * Math.sin(angleOf(i) * DEG),
                y: 0,
                z: (i) => R * Math.cos(angleOf(i) * DEG),
                rotation: 0,
                rotationY: angleOf,
                duration: 0.6,
                ease: EASE.inOut,
                stagger: 0.02,
              },
              count + 0.5,
            )
            .set(cards, { clearProps: "transform,willChange" }); // hand the resting pose back to CSS
        } else {
          spinning = true;
        }

        return () => {
          gsap.ticker.remove(tick);
          removeListeners();
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="deck" style={{ "--n-all": projects.length } as React.CSSProperties}>
      <div className="deck-ring">
        <ul className="deck-spin" aria-label="Selected projects">
          {projects.map((p, i) => (
            <li key={p.slug} className="deck-card" style={{ "--i": i } as React.CSSProperties}>
              <Link href={`/work/${p.slug}`} className="deck-link">
                <span className="deck-face">
                  {p.cover ? (
                    <Image src={p.cover} alt="" fill sizes="200px" loading="eager" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center bg-[#dcdbd6] p-3 pb-10 text-center text-xs uppercase text-ink">
                      [Cover needed]
                    </span>
                  )}
                  <span className="deck-label">{p.title}</span>
                </span>
                <span className="deck-face deck-back" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
