// Owner-supplied facts (from the CV and the owner's answers). Do not add or round numbers here.
// Bracketed values are short keywords for content the owner will write later.
export const site = {
  name: "Demi Phan",
  role: "Creative · Video editor · Motion",
  // Placeholders until the owner supplies them; the phone number is intentionally never published.
  email: "[Add email]",
  linkedin: "[Add LinkedIn URL]",
  /** Public path of the CV PDF once added to public/. */
  cv: "[Add CV.pdf]",
  /** Public path of the portrait once Portrait.png is added to public/. */
  portrait: "[Add Portrait.png]",

  school: "Foreign Trade University",
  major: "International Economics",
  city: "Ho Chi Minh City",
  timezone: "GMT+7",
  availability: "Available from Dec 2026",
  english: "[English level]",
  seeking: "Creative Video Editor / Creative Assistant",

  statement: "[One line: how I think about editing]",
  bio: [
    "I study International Economics at Foreign Trade University in Ho Chi Minh City.",
    "I edit video, motion and VFX for event campaigns and social channels.",
    "[1 line: why an economics background changes how I edit]",
  ],
  howIWork: ["[Step 1: how I read a brief]", "[Step 2: rough cut → feedback]", "[One skill I taught myself for a project]"],

  /** Newest first. `slug` links to a project page. */
  experience: [
    { year: "2026", org: "Marketing Arena 2026", role: "Leader of Creative Communications", note: "National marketing competition — 3,087 participants, 1,029 teams, 80 schools", slug: "videography" },
    { year: "2026", org: "TVCreate 2026", role: "Semi-Finalist", note: "Top 20 of 190+ contestants" },
    { year: "2025", org: "INTERNALATIO", role: "Champion", note: "04/2025" },
    { year: "2024–", org: "Creatio", role: "Creative member", note: "Since 11/2024 · managed the Creatio fanpage (48K+ followers)" },
    { year: "[Year]", org: "Ngoc Ho Medicare", role: "Video editor", note: "Long- and short-form video", slug: "ngoc-ho-medicare" },
  ] as { year: string; org: string; role: string; note: string; slug?: string }[],

  /** Each capability points at the project that proves it. */
  capabilities: [
    { name: "Video editing", proof: ["videography", "ngoc-ho-medicare"] },
    { name: "Motion graphics", proof: ["animation"] },
    { name: "VFX", proof: ["vfx"] },
    { name: "Visual design", proof: ["ma26-design"] },
  ],
  tools: ["Premiere Pro", "After Effects", "Photoshop"],
  sites: [
    ["creatioftu2.com", "https://creatioftu2.com"],
    ["marketingarena.vn", "https://marketingarena.vn"],
  ],
};

/** False while the value is still a bracketed placeholder. */
export const filled = (value: string) => !value.startsWith("[");
