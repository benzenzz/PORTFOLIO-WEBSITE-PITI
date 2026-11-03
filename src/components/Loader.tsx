"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { LOADER_DONE, introOn } from "@/lib/loader";

// The red wipe itself is pure CSS (globals.css .loader) so it runs from first paint; this only ends the intro.
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!introOn()) return;
    const finish = () => {
      document.documentElement.dataset.intro = "off";
      try {
        sessionStorage.setItem("loaderSeen", "1");
      } catch {}
      window.dispatchEvent(new Event(LOADER_DONE));
    };
    // The wipe may already be over by hydration; a finished animation resolves immediately.
    const wipe = root.current!.getAnimations()[0];
    if (wipe) wipe.finished.then(finish, finish);
    else finish();
  }, []);

  return (
    <div ref={root} className="loader" aria-hidden="true">
      <span className="text-[length:clamp(3rem,1rem+10vw,10rem)] font-extrabold leading-none tracking-[-0.045em]">{site.wordmark}</span>
    </div>
  );
}
