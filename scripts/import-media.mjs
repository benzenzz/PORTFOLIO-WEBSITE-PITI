// Copies project media from content-raw/ into public/projects/<slug>/ and writes src/content/media.json.
// Images are resized to MAX px on the long edge; videos are copied as-is if under VIDEO_LIMIT.
// Run: node scripts/import-media.mjs
import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import sharp from "sharp";

const RAW = "content-raw/previous-works";
const MAX = 2000;
const VIDEO_LIMIT = 15 * 1024 * 1024; // shortcut: bigger videos are skipped, compress them (e.g. ffmpeg) to ship them

const sources = {
  "ma26-design": ["design/key-post", "design/posm", "design/muoi-creative"],
  "post-nhat": ["design/post-nhat", "design/daily-post"],
  "project-tet": ["photography/project-tet"],
  "ma25-photo": ["photography/ma25"],
  "loy-choi": ["photography/chup-loy-choi"],
  animation: ["animation"],
  vfx: ["vfx"],
  videography: ["videography-strength"],
  "handy-craft": ["handy-craft"],
};

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

const media = {};
const skipped = [];
for (const [slug, dirs] of Object.entries(sources)) {
  const out = join("public/projects", slug);
  mkdirSync(out, { recursive: true });
  media[slug] = [];
  let n = 0;
  for (const file of dirs.flatMap((d) => walk(join(RAW, d))).sort()) {
    const ext = extname(file).toLowerCase();
    const name = `${slug}-${String(++n).padStart(2, "0")}`;
    if (ext === ".jpg" || ext === ".png") {
      const img = sharp(file).rotate().resize(MAX, MAX, { fit: "inside", withoutEnlargement: true });
      const dest = `${name}${ext}`;
      const info = await (ext === ".jpg" ? img.jpeg({ quality: 85, mozjpeg: true }) : img.png({ compressionLevel: 9 })).toFile(
        join(out, dest),
      );
      media[slug].push({ src: `/projects/${slug}/${dest}`, width: info.width, height: info.height });
    } else if (ext === ".mp4" && statSync(file).size <= VIDEO_LIMIT) {
      copyFileSync(file, join(out, `${name}.mp4`));
      media[slug].push({ src: `/projects/${slug}/${name}.mp4`, video: true });
    } else {
      n--;
      skipped.push(file);
    }
  }
}

writeFileSync("src/content/media.json", JSON.stringify(media, null, 2) + "\n");
console.log("skipped:\n" + skipped.join("\n"));
