// Owner-supplied facts (from the CV). Do not add or round numbers here.
export type Metric = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};
/** `slug` links the highlight to the project page that shows the work. */
export type Highlight = { title: string; period?: string; metrics: Metric[]; body: string; note?: string; slug?: string };

export const site = {
  name: "Demi Phan",
  wordmark: "PITI", // proposed; no © unless the owner approves it
  role: "Creative · Video editor · Motion",
  // Placeholders until the owner supplies them; the phone number is intentionally never published.
  email: "[Add email]",
  linkedin: "[Add LinkedIn URL]",
  instagram: "[Add Instagram URL]",
  /** Public path of the CV PDF once added to public/. */
  cv: "[Add CV.pdf]",
  /** Public path of the portrait once Portrait.png is added to public/. */
  portrait: "[Add Portrait.png]",

  // Remote-hiring facts (owner's answers).
  city: "Ho Chi Minh City",
  timezone: "GMT+7",
  availability: "Available from Dec 2026",
  seeking: "Creative Video Editor / Creative Assistant",
  intro:
    "A creative-driven, detail-oriented student with hands-on experience in video editing, motion graphics, and visual storytelling.",
  // Curated and owner-approved; every figure checked against reference/[RESUME] PITI STH.docx (2026-10-27).
  // metrics[0] is the lead figure of each highlight. Each metric's value is the final, verified number.
  highlights: [
    {
      title: "Creative Communications — Marketing Arena 2026",
      period: "October 2025 – July 2026",
      metrics: [
        { value: 2.4, decimals: 1, suffix: "M", label: "Views" },
        { value: 37, suffix: "K+", label: "Interactions" },
        { value: 14.2, decimals: 1, suffix: "K", label: "Link clicks" },
      ],
      body: "Led creative concepts and campaign communications across social media, website and event touchpoints.",
      note: "Campaign content ran on Creatio’s 48K+ follower fanpage. Nationwide marketing competition: 3,087 participants, 1,029 teams, 80 universities.",
      slug: "videography",
    },
    {
      title: "Digital Experience",
      metrics: [
        { value: 7, suffix: "K+", label: "Sessions" },
        { value: 3, label: "Months" },
      ],
      body: "Managed the Marketing Arena event website on WordPress, using AI-assisted HTML/CSS customization.",
    },
    {
      title: "HƯNG TỴ THÁI BÌNH — Tết 2025",
      metrics: [
        { value: 10, suffix: "K+", label: "Reach" },
        { value: 300, suffix: "+", label: "Engagements" },
      ],
      body: "Contributed to creative ideation and execution, including retouching and image manipulation.",
    },
    {
      title: "TVCreate 2026",
      metrics: [
        { value: 20, prefix: "Top ", label: "Semi-finalist" },
        { value: 190, suffix: "+", label: "Participants nationwide" },
        { value: 5, prefix: "VND ", suffix: "B", label: "IMC campaign" },
        { value: 6, label: "Months" },
      ],
      body: "Semi-finalist, placing in the Top 20 among 190+ participants nationwide. Developed a six-month, VND 5B IMC campaign and produced a TVC for Panasonic Electric Works Vietnam.",
    },
  ] as Highlight[],
  /** Video work outside the highlights above. */
  more: [{ title: "Ngoc Ho Medicare", body: "Video editor — long- and short-form video for the YouTube channel. [Period]", slug: "ngoc-ho-medicare" }],
  howIWork: ["[Step 1: how I read a brief]", "[Step 2: rough cut → feedback]", "[One skill I taught myself for a project]"],
  background: [
    "Creative member, Creatio — November 2024 – August 2026",
    "Foreign Trade University — International Business Economics (expected 2028)",
    "English — IELTS 7.0",
  ],
  // Portfolio categories from the content-raw/ folders — not verified skill claims.
  // Video first, then VFX, then design (owner's priority). Photography and Handy craft are no longer shown.
  capabilities: ["Videography", "VFX", "Animation", "Design"],
  /** Project pages that show each category. */
  proof: { Videography: ["videography", "ngoc-ho-medicare"], VFX: ["vfx"], Animation: ["animation"], Design: ["ma26-design"] } as Record<string, string[]>,
  tools: ["Photoshop", "Premiere Pro", "After Effects", "WordPress", "HTML/CSS", "Codex / Generative AI Tools"],
  sites: [
    ["creatioftu2.com", "https://creatioftu2.com"],
    ["marketingarena.vn", "https://marketingarena.vn"],
  ],
};

/** False while the value is still a bracketed placeholder. */
export const filled = (value: string) => !value.startsWith("[");
