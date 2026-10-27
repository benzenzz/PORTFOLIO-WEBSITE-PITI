// Owner-supplied facts (from the CV). Do not add or round numbers here.
export const site = {
  name: "Demi Phan",
  wordmark: "PITI", // proposed; no © unless the owner approves it
  role: "Creative · Video editor · Motion",
  // Placeholders until the owner supplies them; the phone number is intentionally never published.
  email: "[Add email]",
  linkedin: "[Add LinkedIn URL]",
  instagram: "[Add Instagram URL]",
  intro:
    "A creative-driven, detail-oriented student with hands-on experience in video editing, motion graphics, and visual storytelling.",
  // Curated and owner-approved; every figure checked against reference/[RESUME] PITI STH.docx (2026-10-27).
  highlights: [
    {
      title: "Creative Communications — Marketing Arena 2026",
      period: "October 2025 – July 2026",
      body: "Led creative concepts and campaign communications across social media, website and event touchpoints. Campaign content on Creatio’s 48K+ follower fanpage generated 2.4M views, 37K+ interactions and 14.2K link clicks.",
      note: "Nationwide marketing competition: 3,087 participants, 1,029 teams, 80 universities.",
    },
    {
      title: "Digital Experience",
      body: "Managed the Marketing Arena event website on WordPress, using AI-assisted HTML/CSS customization. The website generated 7K+ sessions in three months.",
    },
    {
      title: "HƯNG TỴ THÁI BÌNH — Tết 2025",
      body: "Contributed to creative ideation, retouching and image manipulation. The project attracted 10K+ reach and 300+ engagements.",
    },
    {
      title: "TVCreate 2026",
      body: "Semi-finalist, placing in the Top 20 among 190+ nationwide participants. Developed a six-month, VND 5B IMC campaign and produced a TVC for Panasonic Electric Works Vietnam.",
    },
  ] as { title: string; period?: string; body: string; note?: string }[],
  background: [
    "Creative member, Creatio — November 2024 – August 2026",
    "Foreign Trade University — International Business Economics (expected 2028)",
    "English — IELTS 7.0",
  ],
  // Portfolio categories from the content-raw/ folders — not verified skill claims.
  capabilities: ["Design", "Photography", "Animation", "VFX", "Videography", "Handy craft"],
  tools: ["Photoshop", "Premiere Pro", "After Effects", "WordPress", "HTML/CSS", "Codex / Generative AI Tools"],
  sites: [
    ["creatioftu2.com", "https://creatioftu2.com"],
    ["marketingarena.vn", "https://marketingarena.vn"],
  ],
};

/** False while the value is still a bracketed placeholder. */
export const filled = (value: string) => !value.startsWith("[");
