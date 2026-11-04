// Prototype only (/lab/space): K95-style "camera inside a cylinder" layouts for owner comparison.
// The production homepage still uses work-space.ts; nothing here is imported by it.
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Texture,
} from "three";

export type LabLayout = "rings" | "spiral";
export type LabMode = "desktop" | "tablet" | "mobile";
/** One image in the space. `project` is the index of the project it belongs to; only covers stand for a project. */
export type LabPanel = { src: string; ratio: number; project: number; cover: boolean };
export type LabSpace = {
  update(t: number): void; // scroll position in stops, 0 … projects − 1
  layout(l: LabLayout): void;
  preview(project: number | null): void;
  pointer(x: number, y: number): void;
  hover(panel: number | null): void;
  pick(clientX: number, clientY: number): number | null;
  resize(): void;
  frame(dt: number): void;
  dispose(): void;
};

// Rings: the camera stands inside the rings, between the axis and the near side, looking at the far side; panels face the axis.
// Spiral: the helix is a column in the middle of the room; the camera stands outside it (inside the wall) and panels turn to it.
const GEO = {
  rings: { r: 7, camZ: 3.85, lookZ: -7, side: -1 },
  spiral: { r: 4.2, camZ: 12, lookZ: 0, side: 1 },
};
const WALL = 13.3; // faint grid cylinder that makes "inside" legible
const AREA = 9; // world units² per cover: equal visual weight whatever the shape
const THUMB = 0.55; // linear scale of a still against a cover
const TURN = (2 * Math.PI) / 6; // spiral: six panels per revolution
const DROP = 0.7; // spiral: vertical drop per panel (one turn = 4.2, more than a cover's height)
const PAPER = 0xf5f4f0;
// fov: vertical degrees. dx/dy: frame offset so the selected cover clears the index column / caption.
// fh/fw: share of the viewport height/width the selected cover may fill. col: NDC x where the index column ends (null: no column).
const VIEW = {
  desktop: { fov: 60, dx: 0.12, dy: 0, fh: 0.52, fw: 0.34, col: -0.44 },
  tablet: { fov: 62, dx: 0.06, dy: 0.04, fh: 0.42, fw: 0.5, col: -0.48 },
  mobile: { fov: 70, dx: 0, dy: 0.1, fh: 0.36, fw: 0.74, col: null },
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (a: number, b: number, rate: number, dt: number) => lerp(a, b, 1 - Math.exp(-rate * dt));
// Hold on each stop for the first and last 15% of the scroll between two stops.
const ease = (t: number) => {
  const k = Math.floor(t);
  return k + smooth(clamp01((t - k - 0.15) / 0.7));
};

export function createLabSpace(host: HTMLElement, panels: LabPanel[], mode: LabMode, initial: LabLayout, onError: () => void, onReady: () => void): LabSpace {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { antialias: true, alpha: true, powerPreference: "high-performance" });
  if (!context) throw new Error("WebGL 2 unavailable");
  const renderer = new WebGLRenderer({ canvas, context });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mode === "mobile" ? 1.25 : 1.5));
  renderer.setClearColor(0x101010, 0);
  canvas.style.display = "block";
  host.appendChild(canvas);
  const onLost = (e: Event) => {
    e.preventDefault();
    onError();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const view = VIEW[mode];
  const TAN = 2 * Math.tan((view.fov * Math.PI) / 360);
  const scene = new Scene();
  const camera = new PerspectiveCamera(view.fov, 1, 0.1, 100);
  const geometry = new PlaneGeometry(1, 1);
  const loader = new TextureLoader();
  const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const n = Math.max(...panels.map((p) => p.project)) + 1;
  let disposed = false;
  let dirty = true;

  const meshes = panels.map((p) => {
    const material = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const mesh = new Mesh(geometry, material);
    const w = Math.sqrt(AREA / p.ratio) * (p.cover ? 1 : THUMB);
    mesh.scale.set(w, w * p.ratio, 1);
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, loadedAt: 0, hover: 0, dSel: 10 };
  });

  // Grid wall: vertical lines every 5°, circles every 2 units.
  const wallPts: number[] = [];
  const SEG = 72;
  for (let i = 0; i < SEG; i++) {
    const a = (i / SEG) * Math.PI * 2;
    const b = ((i + 1) / SEG) * Math.PI * 2;
    wallPts.push(WALL * Math.sin(a), -40, -WALL * Math.cos(a), WALL * Math.sin(a), 14, -WALL * Math.cos(a));
    for (let y = -40; y <= 14; y += 2) wallPts.push(WALL * Math.sin(a), y, -WALL * Math.cos(a), WALL * Math.sin(b), y, -WALL * Math.cos(b));
  }
  const wallGeo = new BufferGeometry();
  wallGeo.setAttribute("position", new Float32BufferAttribute(wallPts, 3));
  const wallMat = new LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.07, depthWrite: false });
  const wall = new LineSegments(wallGeo, wallMat);
  wall.renderOrder = -1;
  scene.add(wall);

  const load = (i: number) =>
    loader.loadAsync(panels[i].src).then((tex: Texture) => {
      if (disposed) return tex.dispose();
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = anisotropy;
      const { mesh } = meshes[i];
      mesh.material.map = tex;
      mesh.material.needsUpdate = true;
      renderer.initTexture(tex);
      mesh.visible = true;
      meshes[i].loadedAt = performance.now();
      dirty = true;
    });
  const coverIdx = panels.flatMap((p, i) => (p.cover ? [i] : []));
  Promise.all(coverIdx.map(load))
    .then(() => {
      if (disposed) return;
      onReady();
      const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
      idle(() => panels.forEach((p, i) => !p.cover && load(i).catch(() => scene.remove(meshes[i].mesh))));
    })
    .catch(() => !disposed && onError());

  // Base placement per layout: angle on the cylinder, height, and which ring (0 middle, 1 upper, 2 lower) carries it.
  let layoutName = initial;
  let base: { phi: number; y: number; ring: number }[] = [];
  const place = () => {
    if (layoutName === "spiral") {
      base = panels.map((_, i) => ({ phi: i * TURN, y: -i * DROP, ring: 0 }));
      return;
    }
    // Rings: covers on the middle ring, one per project; each project's stills directly above / below its cover.
    const hC = Math.max(...meshes.filter((_, i) => panels[i].cover).map((m) => m.mesh.scale.y));
    const thumbH = meshes.filter((_, i) => !panels[i].cover).map((m) => m.mesh.scale.y);
    const yRing = hC / 2 + 0.55 + (thumbH.length ? Math.max(...thumbH) : 0) / 2;
    const seen: number[] = [];
    base = panels.map((p) => {
      const phi = (p.project * 2 * Math.PI) / n;
      if (p.cover) return { phi, y: 0, ring: 0 };
      const j = (seen[p.project] = (seen[p.project] ?? -1) + 1);
      const count = panels.filter((q) => q.project === p.project && !q.cover).length;
      const inRing = j % 2 === 0 ? Math.ceil(count / 2) : Math.floor(count / 2);
      const side = inRing > 1 ? [-1, 1, 1, -1][j] * 0.19 : 0;
      return { phi: phi + side, y: j % 2 === 0 ? yRing : -yRing, ring: j % 2 === 0 ? 1 : 2 };
    });
  };
  place();
  // Spiral: where each project's cover sits in the helix sequence.
  const coverSeq = coverIdx;

  let tScroll = 0;
  let previewIdx: number | null = null;
  let hovered: number | null = null;
  let tCur = 0;
  const rot = [0, 0, 0];
  let camY = 0;
  const ptr = new Vector2();
  const ptrCur = new Vector2();
  const raycaster = new Raycaster();
  const v = new Vector3();
  let W = 1;
  let H = 1;

  const resize = () => {
    W = host.clientWidth || 1;
    H = host.clientHeight || 1;
    renderer.setSize(W, H, false);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    camera.aspect = W / H;
    camera.setViewOffset(W, H, -view.dx * W, view.dy * H, W, H);
    camera.updateProjectionMatrix();
    // Distance at which each panel fills its share of the frame when selected or hovered.
    meshes.forEach((m, i) => {
      const s = panels[i].cover ? 1 : 0.6;
      m.dSel = Math.max(m.mesh.scale.y / (view.fh * s * TAN), m.mesh.scale.x / (view.fw * s * TAN * camera.aspect));
    });
    dirty = true;
  };
  resize();

  const targets = (t: number) => {
    const e = ease(Math.min(t, n - 1));
    if (layoutName === "rings") return { rot: (e * 2 * Math.PI) / n, y: lerp(0.5, -0.5, t / Math.max(1, n - 1)), e };
    const k = Math.min(Math.floor(e), n - 2);
    const s = lerp(coverSeq[k], coverSeq[k + 1], e - k);
    return { rot: s * TURN, y: -s * DROP, e };
  };

  const frame = (dt: number) => {
    if (disposed) return;
    const goal = previewIdx ?? tScroll;
    const prev = tCur + rot[0] + rot[1] + rot[2] + camY + ptrCur.x + ptrCur.y;
    tCur = damp(tCur, goal, 7, dt);
    const tg = targets(tCur);
    rot[0] = tg.rot;
    // Upper and lower rings trail the middle one slightly while moving and line up again at rest.
    rot[1] = damp(rot[1], tg.rot, layoutName === "rings" ? 4.5 : 60, dt);
    rot[2] = damp(rot[2], tg.rot, layoutName === "rings" ? 3.5 : 60, dt);
    camY = layoutName === "spiral" ? tg.y : damp(camY, tg.y, 6, dt);
    ptrCur.set(damp(ptrCur.x, ptr.x, 4, dt), damp(ptrCur.y, ptr.y, 4, dt));
    const now = performance.now();
    let fading = false;

    const g = GEO[layoutName];
    camera.position.set(ptrCur.x * 0.35, camY + ptrCur.y * 0.25, g.camZ);
    camera.lookAt(ptrCur.x * 0.9, camY + ptrCur.y * 0.5, g.lookZ);
    camera.updateMatrixWorld();
    wall.rotation.y = -rot[0] * 0.5;

    meshes.forEach((m, i) => {
      const p = panels[i];
      const b = base[i];
      m.hover = damp(m.hover, hovered === i ? 1 : 0, 10, dt);
      if (!m.mesh.visible) return;
      const a = b.phi - rot[b.ring];
      m.mesh.position.set(g.r * Math.sin(a), b.y, g.side * g.r * Math.cos(a));
      const faceCam = () => Math.atan2(camera.position.x - m.mesh.position.x, camera.position.z - m.mesh.position.z);
      // Selected cover: pulled toward the camera until it fills its share of the frame. Hover pulls any panel a little.
      const focus = p.cover ? smooth(clamp01(1 - Math.abs(tg.e - p.project) * 2)) : 0;
      const pull = Math.max(focus, 0.3 * m.hover);
      const rest = layoutName === "rings" ? -a : faceCam();
      let yaw = rest;
      if (pull > 0.001) {
        v.copy(camera.position).sub(m.mesh.position);
        const d = v.length();
        const dTo = lerp(d, Math.min(d, m.dSel), pull);
        m.mesh.position.addScaledVector(v, (d - dTo) / d);
        yaw = lerp(rest, faceCam(), pull);
      }
      m.mesh.rotation.y = yaw;
      m.mesh.renderOrder = Math.round(pull * 10);
      const o = clamp01((now - m.loadedAt) / 400);
      if (o < 1) fading = true;
      // Panels passing behind the index column dim, so its text stays readable; the selected cover never does.
      let col = 1;
      if (view.col !== null) {
        const x = v.copy(m.mesh.position).project(camera).x;
        col = Math.max(pull, lerp(0.18, 1, smooth(clamp01((x - (view.col - 0.3)) / 0.3))));
      }
      m.mesh.material.opacity = o * col;
    });

    const moved = Math.abs(prev - (tCur + rot[0] + rot[1] + rot[2] + camY + ptrCur.x + ptrCur.y)) > 1e-5;
    if (dirty || moved || fading || meshes.some((m) => m.hover > 0.001 && m.hover < 0.999)) {
      renderer.render(scene, camera);
      dirty = false;
    }
  };

  return {
    update: (t) => {
      tScroll = t;
      dirty = true;
    },
    layout: (l) => {
      layoutName = l;
      place();
      dirty = true;
    },
    preview: (i) => {
      previewIdx = i;
      dirty = true;
    },
    pointer: (x, y) => ptr.set(x, y),
    hover: (i) => {
      hovered = i;
      dirty = true;
    },
    pick: (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new Vector2(((clientX - r.left) / r.width) * 2 - 1, 1 - ((clientY - r.top) / r.height) * 2), camera);
      const hit = raycaster.intersectObjects(meshes.filter((m) => m.mesh.visible).map((m) => m.mesh))[0];
      return hit ? meshes.findIndex((m) => m.mesh === hit.object) : null;
    },
    resize,
    frame,
    dispose: () => {
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onLost);
      meshes.forEach(({ mesh }) => {
        mesh.material.map?.dispose();
        mesh.material.dispose();
      });
      geometry.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      renderer.dispose();
      if (!context.isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
