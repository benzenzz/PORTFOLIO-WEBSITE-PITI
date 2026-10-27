// html[data-intro]: absent until the gate script runs, then "on" (play loader) or "off".
// CSS shows the loader while it is not "off", so a first visit never flashes the finished page.
export const LOADER_DONE = "loader:done";

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

// Runs before hydration: first visit to the home page in this session with motion allowed → "on", otherwise "off".
// Deep links (case studies) skip the intro so the work shows immediately.
export const loaderGateScript = `try{document.documentElement.dataset.intro=location.pathname==="/"&&!sessionStorage.getItem("loaderSeen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches?"on":"off"}catch(e){document.documentElement.dataset.intro="off"}`;
