// The loader runs only when the inline script in layout.tsx set html[data-loader].
export const LOADER_DONE = "loader:done";

/** Calls `cb` once the loader has finished (immediately if it never ran). Returns a cleanup. */
export function whenLoaderDone(cb: () => void) {
  if (!document.documentElement.hasAttribute("data-loader")) {
    cb();
    return () => {};
  }
  window.addEventListener(LOADER_DONE, cb, { once: true });
  return () => window.removeEventListener(LOADER_DONE, cb);
}

// Runs before paint: decides whether to show the loader, so JS-off or repeat visits never see it.
export const loaderGateScript = `try{if(!sessionStorage.getItem("loaderSeen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute("data-loader","")}}catch(e){}`;
