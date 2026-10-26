// Real data comes from content-raw/ (folder names only). Anything the owner has not supplied
// stays a bracketed placeholder — never fill these with invented facts.
export type Project = {
  title: string;
  slug: string;
  year: string;
  category: string;
  role: string;
  /** Public path once the asset is copied from content-raw/ into public/projects/<slug>/. */
  cover: string | null;
  description: string;
  media: string[];
  source: string;
};

const TODO = {
  year: "[Project year]",
  role: "[Project role]",
  description: "[Add project description]",
};

const p = (
  slug: string,
  title: string,
  category: string,
  source: string,
): Project => ({ ...TODO, slug, title, category, source, cover: null, media: [] });

export const projects: Project[] = [
  p("ma26-design", "MA26 — Key visuals & posts", "Visual design", "design/key-post, design/posm, design/muoi-creative"),
  p("post-nhat", "Post nhật series", "Visual design", "design/post-nhat, design/daily-post"),
  p("project-tet", "Project Tết", "Photography", "photography/project-tet"),
  p("ma25-photo", "MA25 event photography", "Photography", "photography/ma25"),
  p("loy-choi", "Chụp lơ chơi", "Photography", "photography/chup-loy-choi"),
  p("animation", "Motion & invitations", "Animation", "animation"),
  p("vfx", "VFX teasers", "VFX", "vfx"),
  p("videography", "Event videography", "Videography", "videography-strength"),
  p("handy-craft", "Handy craft", "Handmade", "handy-craft"),
];
