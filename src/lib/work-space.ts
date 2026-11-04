// The Selected Work 3D space (SelectedWork.tsx loads this module lazily). One camera, flat unlit artwork planes faded by depth:
// no lights, fog, shaders, models or post-processing. Covers and thumbnails keep their true colours and aspect ratios.
import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  type Texture,
} from "three";

export type SpaceItem = { src: string; ratio: number; thumbs: { src: string; ratio: number }[] };
export type SpaceMode = "desktop" | "tablet" | "mobile";
export type Space = {
  /** t = position along the path in stops (0 … n−1); row = 0 … 1, the closing move into a row of all covers. */
  update(t: number, row: number): void;
  /** Index preview (hover / keyboard focus): the camera eases to that stop without scrolling the page. */
  preview(i: number | null): void;
  /** Pointer in −1 … 1 (fine pointers only), for parallax. */
  pointer(x: number, y: number): void;
  hover(i: number | null): void;
  /** Project index under a client-space point, or null. */
  pick(clientX: number, clientY: number): number | null;
  resize(): void;
  /** Advance damping by dt seconds; renders only when something moved. */
  frame(dt: number): void;
  dispose(): void;
};

const FOV = 32;
const TAN = 2 * Math.tan((FOV * Math.PI) / 360);
const AREA = 6; // world units² per cover, so every cover has the same visual weight whatever its shape
const INK = "#101010";
// Thumbnail slots around a cover: x / y in cover half-sizes, z behind the cover (so the cover always reads first), y-rotation in degrees.
const SLOTS = [
  [1.24, 0.6, -1.4, -6],
  [-1.3, -0.5, -2.2, 7],
  [1.3, -0.74, -3, 5],
  [-1.2, 0.8, -3.6, -8],
] as const;
// Where the cover sits in the frame: share of the viewport it may fill, and the projection shift that keeps it clear of the
// editorial column (desktop / tablet: cover right of centre) or of the bottom title strip (mobile: cover above centre).
const FRAME = {
  desktop: { w: 0.5, h: 0.56, dx: 0.14, dy: 0 },
  tablet: { w: 0.5, h: 0.5, dx: 0.14, dy: 0 },
  mobile: { w: 0.92, h: 0.5, dx: 0, dy: 0.07 },
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const size = (ratio: number) => {
  const w = Math.sqrt(AREA / ratio);
  return { w, h: w * ratio };
};

type Panel = { mesh: Mesh<PlaneGeometry, MeshBasicMaterial>; item: number; w: number; h: number; loadedAt: number; lift: number };

export function createSpace(host: HTMLElement, items: SpaceItem[], mode: SpaceMode, onError: () => void, onReady: () => void): Space {
  // Our own context first, so a device without WebGL 2 fails quietly (the caller falls back) instead of three logging errors.
  // Transparent: the section's ink and grain show through, so there is no seam where the stage meets the archive.
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { antialias: true, alpha: true, powerPreference: "high-performance" });
  if (!context) throw new Error("WebGL 2 unavailable");
  const renderer = new WebGLRenderer({ canvas, context });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mode === "mobile" ? 1.25 : 1.5));
  renderer.setClearColor(INK, 0);
  canvas.style.display = "block";
  host.appendChild(canvas);
  const onLost = (e: Event) => {
    e.preventDefault();
    onError();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 200);
  const geometry = new PlaneGeometry(1, 1);
  const loader = new TextureLoader();
  const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const frame = FRAME[mode];
  const n = items.length;
  let disposed = false;

  // Live state; everything visual is derived from it each frame, so reversing the scroll retraces the same poses.
  let tScroll = 0;
  let row = 0;
  let previewIdx: number | null = null;
  let hovered: number | null = null;
  let tCur = 0;
  const ptr = new Vector2();
  const ptrCur = new Vector2();
  let dirty = true;
  let fading = false;

  const panel = (item: number, ratio: number): Panel => {
    // No depth writes: fading panels are sorted back to front and never cut holes in the ones behind them.
    const material = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, item, ...size(ratio), loadedAt: 0, lift: 0 };
  };
  const covers = items.map((it, i) => panel(i, it.ratio));
  const thumbs = items.flatMap((it, i) =>
    it.thumbs.map((t, j) => {
      const p = panel(i, t.ratio);
      // Thumbnails are a quarter of a cover's area.
      p.w *= 0.5;
      p.h *= 0.5;
      p.mesh.rotation.y = (SLOTS[j][3] * Math.PI) / 180;
      return { p, slot: SLOTS[j] };
    }),
  );

  const load = (p: Panel, src: string) =>
    loader.loadAsync(src).then((tex: Texture) => {
      if (disposed) return tex.dispose();
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = anisotropy;
      p.mesh.material.map = tex;
      p.mesh.material.needsUpdate = true;
      renderer.initTexture(tex); // upload now, one texture at a time, not all on the first frame that shows them
      p.mesh.visible = true;
      p.loadedAt = performance.now();
      dirty = true;
    });
  const thumbSrcs = items.flatMap((it) => it.thumbs.map((t) => t.src));
  // Covers first; any cover failing means the space can't show the work, so the page falls back to the archive list.
  Promise.all(covers.map((p, i) => load(p, items[i].src)))
    .then(() => {
      if (disposed) return;
      onReady();
      // Thumbnails after, when the browser is idle; a missing one is simply left out.
      const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
      idle(() => thumbs.forEach(({ p }, k) => load(p, thumbSrcs[k]).catch(() => scene.remove(p.mesh))));
    })
    .catch(() => !disposed && onError());

  // Layout (world units), recomputed on resize because the camera distance depends on the viewport's shape.
  let D = 8;
  let far = [12, 12];
  let stops: { x: number; y: number; z: number }[] = [];
  let rowSlots: { x: number; y: number; z: number; s: number }[] = [];
  let W = 1;
  let H = 1;

  const layout = () => {
    W = host.clientWidth || 1;
    H = host.clientHeight || 1;
    renderer.setSize(W, H, false);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    camera.aspect = W / H;
    camera.setViewOffset(W, H, -frame.dx * W, frame.dy * H, W, H);
    camera.updateProjectionMatrix();

    const maxW = Math.max(...covers.map((c) => c.w));
    const maxH = Math.max(...covers.map((c) => c.h));
    D = Math.max(maxH / (frame.h * TAN), maxW / (frame.w * TAN * camera.aspect));
    const gap = Math.max(12, D * 1.6);
    // Covers alternate below / above the path by more than half a cover, so the camera flies past, never through. Vertical,
    // not sideways: the faint next stop then stays in the artwork area instead of drifting under the index column.
    const lat = maxH / 2 + 0.9;
    stops = covers.map((_, k) => ({ x: (k % 2 ? -1 : 1) * 0.5, y: (k % 2 ? 1 : -1) * lat, z: -k * gap }));
    // Depth fade by opacity, not fog colour (fog would tint the work and show as dark boxes over the grain): the framed cover and
    // its thumbnails stay fully visible; the next stop is a faint hint, so it never reads as part of this one.
    // Next stop at 25 %, anything further gone. On phones the hint would sit under the number row, so it is gone too.
    far = [D + 4, (gap - 4) / (mode === "mobile" ? 1 : 0.75)];

    // Closing row, centred in the same frame as a stop (3 × 2 on mobile).
    const cols = mode === "mobile" ? 3 : n;
    const rows = Math.ceil(n / cols);
    const hv = TAN * D;
    const rowW = hv * camera.aspect * (mode === "mobile" ? 0.9 : 0.62);
    const cellW = rowW / cols;
    const cellH = (hv * (mode === "mobile" ? 0.5 : 0.36)) / rows;
    const last = stops[n - 1];
    rowSlots = covers.map((c, i) => {
      const col = i % cols;
      const r = Math.floor(i / cols);
      return {
        x: last.x + (col - (cols - 1) / 2) * cellW,
        y: last.y + ((rows - 1) / 2 - r) * cellH,
        z: last.z,
        s: Math.min((0.84 * cellW) / c.w, (0.84 * cellH) / c.h),
      };
    });
    dirty = true;
  };

  const camAt = (t: number) => {
    const k = Math.min(Math.floor(t), n - 2);
    const u = clamp01((t - k - 0.18) / 0.64); // dwell at each stop, travel between
    // Pan leads, dolly follows: the departing cover slides out of frame before the camera closes in on it, so it never
    // balloons at the screen edge on its way past.
    const pan = smooth(clamp01(u / 0.7));
    const dolly = smooth(clamp01((u - 0.2) / 0.8));
    const a = stops[k];
    const b = stops[k + 1];
    return { x: lerp(a.x, b.x, pan), y: lerp(a.y, b.y, pan), z: lerp(a.z, b.z, dolly) + D };
  };

  const render = (now: number) => {
    const c = camAt(tCur);
    camera.position.set(c.x + ptrCur.x * 0.22, c.y + ptrCur.y * 0.16, c.z);
    let fading = false;
    // Load fade-in, times a dissolve once the camera is closer than ¾ of the framing distance (gone at 0.45), so passing
    // artwork is never shown at more than ~1.3× its framed size.
    const fade = (p: Panel) => {
      const a = p.loadedAt ? clamp01((now - p.loadedAt) / 450) : 0;
      if (a < 1 && p.loadedAt) fading = true;
      const dist = camera.position.z - p.mesh.position.z;
      return a * clamp01((dist - 0.45 * D) / (0.3 * D)) * (1 - clamp01((dist - far[0]) / far[1]));
    };
    covers.forEach((p, i) => {
      const s = stops[i];
      const slot = rowSlots[i];
      // Closing row: the last cover travels into its slot; the others (already behind the camera) rise into theirs.
      const r = smooth(clamp01((row - 0.05 * i) / 0.6));
      const from = i === n - 1 ? { ...s, s: 1 } : { x: slot.x, y: slot.y - 0.6, z: slot.z, s: slot.s };
      const at = r > 0 ? { x: lerp(from.x, slot.x, r), y: lerp(from.y, slot.y, r), z: lerp(from.z, slot.z, r), s: lerp(from.s, slot.s, r) } : { ...s, s: 1 };
      p.mesh.position.set(at.x, at.y, at.z + p.lift);
      p.mesh.scale.set(p.w * at.s, p.h * at.s, 1);
      p.mesh.material.opacity = fade(p) * (i === n - 1 || row === 0 ? 1 : r);
    });
    thumbs.forEach(({ p, slot }) => {
      const cv = covers[p.item];
      p.mesh.position.set(cv.mesh.position.x + (slot[0] * cv.w) / 2, cv.mesh.position.y + (slot[1] * cv.h) / 2, stops[p.item].z + slot[2]);
      p.mesh.scale.set(p.w, p.h, 1);
      p.mesh.material.opacity = fade(p) * (1 - clamp01(row / 0.3));
    });
    renderer.render(scene, camera);
    return fading;
  };

  const raycaster = new Raycaster();
  const ndc = new Vector2();

  layout();

  return {
    update(t, r) {
      if (t === tScroll && r === row) return;
      tScroll = t;
      row = r;
      dirty = true;
    },
    preview(i) {
      previewIdx = i;
      dirty = true;
    },
    pointer(x, y) {
      ptr.set(x, y);
      dirty = true;
    },
    hover(i) {
      hovered = i;
      dirty = true;
    },
    pick(x, y) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(scene.children).find((h) => (h.object as Mesh<PlaneGeometry, MeshBasicMaterial>).material.opacity > 0.5);
      return hit ? ([...covers, ...thumbs.map((t) => t.p)].find((p) => p.mesh === hit.object)?.item ?? null) : null;
    },
    resize: layout,
    frame(dt) {
      const k = 1 - Math.exp(-dt * 7);
      const target = previewIdx ?? tScroll;
      const moving = Math.abs(target - tCur) > 1e-4 || ptrCur.distanceToSquared(ptr) > 1e-7 || covers.some((p) => Math.abs((p.item === hovered ? 0.3 : 0) - p.lift) > 1e-3);
      if (!moving && !dirty && !fading) return;
      tCur = Math.abs(target - tCur) > 1e-4 ? lerp(tCur, target, k) : target;
      ptrCur.lerp(ptr, k);
      covers.forEach((p) => (p.lift = lerp(p.lift, p.item === hovered ? 0.3 : 0, k)));
      dirty = false;
      fading = render(performance.now());
    },
    dispose() {
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onLost);
      [...covers, ...thumbs.map((t) => t.p)].forEach((p) => {
        p.mesh.material.map?.dispose();
        p.mesh.material.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      if (!context.isContextLost()) renderer.forceContextLoss(); // free the GPU context now rather than at GC
      canvas.remove();
    },
  };
}
