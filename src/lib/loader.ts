// html[data-intro]: absent until the gate script runs, then "on" (play loader) or "off".
// CSS shows the loader while it is not "off", so a first visit never flashes the finished page.
export const LOADER_DONE = "loader:done";
// Seconds.
export const LOADER_TIMING = { count: 1.2, reveal: 0.6 };

export const introOn = () => document.documentElement.dataset.intro === "on";

/** Calls `cb` once the loader has finished (immediately if it never ran). Returns a cleanup. */
export function whenLoaderDone(cb: () => void) {
  if (!introOn()) {
    cb();
    return () => {};
  }
  window.addEventListener(LOADER_DONE, cb, { once: true });
  return () => window.removeEventListener(LOADER_DONE, cb);
}

// Runs before hydration: first visit in this session with motion allowed → "on", otherwise "off".
export const loaderGateScript = `try{document.documentElement.dataset.intro=!sessionStorage.getItem("loaderSeen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches?"on":"off"}catch(e){document.documentElement.dataset.intro="off"}`;
