// Owner-supplied facts (from the CV). Do not add or round numbers here.
export const site = {
  name: "Demi Phan",
  role: "Creative · Video editor · Motion",
  // Placeholders until the owner supplies them; the phone number is intentionally never published.
  email: "[Add email]",
  linkedin: "[Add LinkedIn URL]",
  intro:
    "A creative-driven, detail-oriented student with hands-on experience in video editing, motion graphics, and visual storytelling.",
  highlights: [
    "Leader of Creative Communications, Marketing Arena 2026 — a national marketing competition (3,087 participants, 1,029 teams, 80 schools)",
    "Managed the Creatio fanpage (48K+ followers)",
    "Creative member, Creatio — since 11/2024",
    "Semi-Finalist, TVCreate 2026 — top 20 of 190+ contestants",
    "Champion, INTERNALATIO — 04/2025",
    "Long- and short-form video editing for Ngoc Ho Medicare",
  ],
  capabilities: ["Design", "Photography", "Animation", "VFX", "Videography", "Handy craft"],
  tools: ["Photoshop", "Premiere Pro", "After Effects", "WordPress", "HTML/CSS"],
  sites: [
    ["creatioftu2.com", "https://creatioftu2.com"],
    ["marketingarena.vn", "https://marketingarena.vn"],
  ],
};

/** False while the value is still a bracketed placeholder. */
export const filled = (value: string) => !value.startsWith("[");
