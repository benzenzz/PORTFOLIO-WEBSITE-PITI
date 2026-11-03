# Phase 2 — Creative Direction & Design System Proposal

Status: **conditionally approved by the owner with the amendments in §0.** Only the Selected Work prototype (Phase 3, refined in Phase 3.1) is authorised; the rest of the homepage is not started. Where §0 and a later section disagree, §0 wins; sections below have been reconciled in place to the implemented behaviour.
Evidence base: Phase 1 analysis (12 moodboard images, live huyml.co at 1440/390 px, "Caseys Portfolio .mp4" at sampled timestamps, `public/projects/`, `content-raw/INVENTORY.md`, existing `src/`).
Moodboard files are cited by their first four characters (e.g. `d388` = `Moodboard/d3886086e5c2e9b269f3c40169ed087f.jpg`).

Legend — **M** = measured (pixel sampling, contrast maths, timed screenshots) · **O** = observed by eye · **I** = interpretation. Confidence: **H / M / L**.

---

## 0. Owner amendments (supersede any conflicting text below)

**Approved as proposed:** D1 original artwork colours (no automatic duotone); D2 monochrome interface with intentional red and at most two full-field moments; D3 natural-scroll active-project stage (no scroll-jacking); D6 contact details stay placeholders until the owner supplies URLs and confirms channels; D7 the Selected Work stage replaces the 24-tile Gallery as the homepage's primary experience.

**Amended**
1. **Rollback:** `Gallery.tsx`, its CSS and its assets are preserved. Nothing is deleted and no shared functionality is removed until the replacement passes visual and functional QA.
2. **Loader / wipe (replaces D4):** no fake loading delay and no blocking of content. A red entrance wipe is allowed as a brief signature transition, target **≤ 0.6 s**; it must not delay essential content, must honour `prefers-reduced-motion`, and must not replay on internal navigation without a clear reason. The Contact section may use its own red field if justified in the spec.
3. **Naming (replaces D5):** "Demi Phan" = personal name; "**PITI**" = proposed wordmark. **Not** "PITI©" by default — copyright stays separate unless the owner approves the symbol as part of the identity. Name and wordmark must be easy to change from the content configuration (`src/content/site.ts`).
4. **Tết calendar (replaces R1 handling):** `project-tet` and `handy-craft` appear to be one Year of the Snake calendar project. Preferred default: **one overarching case study with two clearly separated groups** — *Handmade illustration* and *Photography & retouch* — under the verified project name. No files are moved and no asset mappings are rewritten on the strength of filenames; the mapping is proposed, ambiguities flagged. Split into two top-level projects only if the evidence shows independent briefs. (The Phase 3 prototype leaves the two existing entries as they are.)
5. **Typography (replaces §3.2 mono ban):** Inter 800 for headlines; Anton for selected numerals only where the prototype shows a clear benefit. A **restrained monospace** is permitted for small editorial labels, indices and technical metadata (supported by `0b3b`, `1c4d`). Reuse existing fonts or system stacks (`ui-monospace`); no new font dependency without a demonstrated need.
6. **Video posters:** the video-only projects (`animation`, `vfx`, `videography`) need real preview frames taken from the actual footage, chosen by inspection — not the first frame by default, nothing generated. If no suitable frame exists, report it and propose the minimum fix. *Done in Phase 3 (frames chosen by inspection of 8 candidates per video): `animation` ← `animation-01.mp4` @ 27.49 s; `vfx` ← `vfx-02.mp4` @ 16.90 s; `videography` ← `videography-01.mp4` @ 8.05 s ("MISSION VIETNAM" clipboard). Saved as `public/projects/<slug>/poster.jpg`; the `poster` field in `projects.ts` keeps `cover` untouched so the preserved Gallery is unaffected. Owner may swap any frame.*
8. **Project-list interaction (final, Phase 3.1):** *selecting* and *opening* are separate controls. Index rows are `<button>`s (inside a `role="group"` labelled "Choose project", `aria-current` on the active one) that change the active project and scroll its step to the viewport centre. Opening the case study is the explicit "Open project →" `<a>` (accessible name "Open project: <title>"). The large image is also a link but is `aria-hidden` and `tabindex=-1` so it never creates a second keyboard/AT action. DOM order, which is also tab order: heading → image → index → [Pause/Play video] → Open project; the info column is *placed* bottom-left by grid, not by DOM order.
9. **Breakpoint (verified):** the three-column stage (3 / 7 / 2 columns: info · media · index) starts at **1024 px**. At 1024 the index uses `text-sm` (it overflowed its column at `text-base`); from 1280 px it uses `text-base`. Below 1024 px the stage is replaced by stacked cards: one column below 768 px, two columns from 768 px. Videos autoplay on the desktop stage only; cards show posters.
10. **Wordmark:** "PITI" without ©; the copyright line, if shown, is a separate element.
12. **Phase 4 (homepage) implementation notes:**
    - *Loader:* the 1.2 s count is removed (it was a fake delay). First home visit per session shows a CSS-driven red wipe with the `PITI` wordmark that starts at first paint (0.1 s delay + 0.6 s wipe, measured ≈ 0.53 s); skipped on reduced motion, deep links and repeat visits. This is red-field moment 1; Contact is moment 2.
    - *Header:* solid, no blur; takes the surface of the section beneath it (`data-surface` = paper / ink / red on each section) and marks the section being read (`aria-current="location"` + 6 px square). Wordmark `PITI` + mono "Demi Phan", both from `site.ts`.
    - *Section labels:* (01) Introduction · (02) Selected work · (03) About · (04) Contact.
    - *Contact:* full-viewport red field (it must fill the viewport so the header and the Contact nav link can reach it). Unconfirmed channels are hidden in production ("Contact details are coming soon.") and shown as dashed, labelled placeholders only in development. Instagram added to `site.ts` as a placeholder.
    - *Footer:* `PITI` · "© Demi Phan" (no year: not supplied) · Back to top. Global, so it also appears on case-study pages.
    - *Grain:* one `.grain` utility at `z-index:-1` inside an isolated section — never above text or media; 9% on ink/red, 5% on paper.
11. **Phase 3 scope:** Selected Work stage only. No full-homepage rollout, no restyling of unrelated pages, existing routes, source media and unrelated sections stay intact. Acceptance criteria in the owner's review message replace §9 where they differ (screenshots at ~1440 and ~390 px, scroll-sync demo, link/keyboard checks, reduced-motion and touch checks, broken-media/overflow/console/collision checks, the three highest-impact visual mismatches, build + lint results). No numerical moodboard-similarity score.

---

## 1. Executive design direction

**"Cinematic grain, full-colour work."** A monochrome, grain-textured editorial interface — bold tight grotesk headlines, tiny corner labels, index numbers, a single hard red — acts as a dark-room frame. Inside that frame, Demi's real work appears **untouched, in its own saturated colour**. The contrast between the quiet mono shell and the loud work *is* the art direction: the interface borrows the moodboard's tension; the work keeps its identity.

The homepage centres on one signature interaction adapted from Huyml: **one active project at a time** — image, title list, counter and metadata kept in sync — driven by **normal scrolling**, never a hijacked wheel. Red appears as a precise signal throughout and as a full field in exactly two moments: the first-visit loader exit and the Contact section.

---

## 2. Decisions

### 2.1 Recommended — require owner approval

| # | Recommendation | Why | Trade-off |
|---|---|---|---|
| D1 | **Show all real artwork in its original colour.** Remove the red-duotone tiles (`ACCENTS` in `Gallery.tsx`) from genuine covers. Interface treatments (grain, blur) never sit on top of the work at rest. | CLAUDE.md §3 "let thumbnails retain their own art direction"; the real work is highly saturated (cyan/gold/orange — Marketing Arena KVs, Tết calendars). Duotone misrepresents it. | The page is less uniformly "moodboard-looking". Mitigated by framing the work on an ink ground (§4). |
| D2 | **Monochrome interface; full-field red in two moments only** (loader exit wipe, Contact section). Elsewhere red is ≤ ~5% of any viewport. | Moodboard **M**: 6/12 images have 0% red; 4/12 use red as a 38–85% field (`4ce9` 85%, `c98a` 77%, `4e62` 55%, `2f7f` 38%). Both modes are real; two field moments honour the second without breaking CLAUDE.md "red sparingly". | Fewer "poster" moments than the moodboard has. |
| D3 | **Huyml's synchronised active-project index on native scroll.** A sticky stage whose active project follows scroll position; no wheel capture, no forced snapping. | Huyml **M**: `scrollHeight` = viewport, one wheel notch = one project — scroll-jacking, which CLAUDE.md §4 forbids as default. The *sync* is the valuable part, not the hijack. | Less "slot-machine" precision than Huyml; the visitor can land between projects (handled with a clear active threshold). |
| D4 | **One red wipe per session, at the loader exit only** — the loader's red progress bar grows into a full-field wipe that uncovers the hero. **≤ 0.7 s wipe**, total intro ≤ 1.8 s (existing `LOADER_TIMING`: count 1.2 s + reveal 0.6 s). Page navigation keeps the existing gallery-to-cover View Transition. | Casey **M**: wipe rises ~0.6 s, holds ~0.8 s, fades ~0.8 s ≈ 2.2 s per navigation — too slow to repeat on every click. Re-using the wipe on each project open would also fight the shared-element transition built in Phase 7. | Casey's per-page wipe rhythm is lost; we keep one memorable instance. |
| D5 | **Naming:** personal identity = **"Demi Phan"** (headline, `<title>`, About, metadata). **"PITI"** = the wordmark in the header and footer only (no © — see §0.3). | `site.ts` already uses "Demi Phan"; the workflow/repo call the project "PITI". One person-name + one mark mirrors the Huyml "HUYML©" mark without copying it. | Requires owner confirmation that "PITI" is a public handle, not just a project codename. |
| D6 | **Contact stays placeholder until channels are confirmed.** No phone number, ever, without explicit permission (already enforced in `site.ts`). Unfilled channels are hidden in production via the existing `filled()` helper, not shown as "[Add email]". | Owner instruction; CLAUDE.md §7. | Contact section cannot be visually finalised until real values exist. |
| D7 | **Retire `Gallery` from the homepage** (the 24-tile morph loop). Keep the file until the owner approves deletion. | It repeats 6 covers across 24 tiles (reads as filler), applies duotone (D1), and its autoplay morph competes with the new work index for the "signature" role. | Loses an existing, working animation from Phase 4. |

### 2.2 Unresolved — need owner input (see §8)

- U1 `project-tet` vs `handy-craft` mapping (see §7 — *not a swap*; possibly one project split in two).
- U2 Resume not accessible → `site.ts` highlights remain **unverified** in this proposal.
- U3 Project years, roles, outcomes — all placeholders.
- ~~U4 Video-only projects have no poster~~ — **done**: poster frames chosen from the real footage (§0.6).

---

## 3. Colour & typography

### 3.1 Colour

| Token | Value | Role | Evidence | Conf. |
|---|---|---|---|---|
| `--color-ink` | `#101010` (existing) | Dark grounds, primary text | Moodboard dark share **M**: `0b3b` 71%, `1c4d` 69%, `70fd` 64% | H |
| `--color-paper` | `#F5F4F0` (existing) | Light grounds | Light share **M**: `8733` 76%, `d388` 63%, `07d0` 61%; grey-warm paper stock **O** in `d388` | H |
| `--color-red` | `#FF343B` (existing) | Accent marks, large type, active indicators, on **ink** | `d388` accent sampled `#EE3839` **M** | M |
| `--color-red-text` *(new)* | `#D7141B` (estimate) | Red text **< 24 px on paper** | `#FF343B` on paper = **3.29:1 M** (fails AA for small text); `#D7141B` = **4.76:1 M** | H (maths) / M (hue) |
| `--color-red-field` *(new)* | `#C4161C` (estimate) | Full-field red (loader wipe, Contact) | Field reds sampled `#BE1C1C` (`4ce9`), `#D60908` (`c98a`), `#C2312E` (`4e62`) **M**; paper text on it = **5.49:1 M** | M |
| `--color-gray` | `#6B6B6B` (existing) | Secondary text on paper | **4.84:1 M** (the code comment's "≈5.1" is slightly high; still AA) | H |
| `--color-gray-on-ink` *(new)* | `#9A9A9A` | Secondary text on ink | **6.76:1 M** | H |
| `--color-line` | `rgba(16,16,16,.16)` (existing) | Dividers on paper; inverse `rgba(245,244,240,.16)` on ink | — | H |

**Usage rules**
- Target proportions per homepage scroll (**I**, review by eye): ~55% paper, ~35% ink, red ≤ 5% outside the two field moments. Project media is excluded from this count — it keeps its own colours.
- Red never carries meaning alone (active state also uses weight/opacity/marker shape).
- `#101010` on `#FF343B` = 5.26:1 → ink text on bright red is allowed; ink on `--color-red-field` = 3.15:1 → large text only.
- No gradients, shadows, rounded panels, or glass blur (CLAUDE.md §3). The current header's `backdrop-blur-sm` should become a solid ground.

### 3.2 Typography

**Fonts already loaded:** Anton (display), Inter (body) — both with Vietnamese subsets. No new font is required.

| Role | Face / weight | Size token | Tracking | Line-height | Evidence | Conf. |
|---|---|---|---|---|---|---|
| Display headline | **Inter 800**, mixed case or uppercase | `display-lg` / `display-xl` | −0.04 em | 0.9 | Bold, tight neo-grotesk headlines: `07d0`, `8d3c`, `d388` "ITERATION-01" **O** | M (typeface identity is **I**) |
| Condensed accent | **Anton** — counters, one statement per page max | `display-md`–`display-xl` | 0 | 0.85 | Condensed display appears only as one-offs: `4e62` "RAGE", `2f7f` "REBRANDING" **O** | M |
| Section title | Inter 800 uppercase | `display-md` | −0.03 em | 0.95 | as display | M |
| Label / metadata | Inter 500 uppercase, `tabular-nums` | `text-xs` | +0.1 em | 1.3 | Tiny corner labels & index numbers: `07d0`, `8d3c`, `d388`, `2816` **O** | H |
| Body | Inter 400 | `text-base` | 0 | 1.5, max 60 ch | Readability (CLAUDE.md §3) | H |
| Vertical text | Inter 300–400, rotated 90° | `display-md` | 0 | 1 | `d388` "Fade into you" **O** | M — use once on the page |

**Change from today (I):** Anton currently carries every headline. The moodboard's dominant voice is a heavy grotesk, with condensed type as an occasional disruption. Proposal: Inter 800 becomes the headline voice; Anton moves to numerals (project counter, loader count) and at most one statement per page.
**Monospace (approved, restrained):** small editorial labels, indices and technical metadata only (`0b3b`, `1c4d` use mono **O**), using the system `ui-monospace` stack (Tailwind `font-mono`). No new font dependency.

---

## 4. Layout & component rules

### 4.1 Grid & space

| Rule | Spec | Evidence | Conf. |
|---|---|---|---|
| Columns | 12 desktop (≥ 1024), 6 tablet (640–1023), 4 mobile; column gap `clamp(12px, 1.5vw, 24px)` | CLAUDE.md §3 strong grid | H |
| Margins | Existing `--space-gutter` (16–48 px) and `--space-section` (64–160 px) | Existing tokens | H |
| Corner-label frame | Hero uses four corner labels framing a large empty field | `07d0`, `8d3c` four-corner labels; `2816` top/bottom labels **O** | H |
| Asymmetry | Headline blocks span cols 1–8; metadata sits off-axis (cols 10–12); never centred symmetric layouts except the stage image | `d388`, `0b3b` off-centre text blocks **O** | M |
| Scale contrast | Pair one very large element with very small labels in the same view | "small figure, large space" `07d0`, `8d3c`, `70fd` **O** | H |
| Image ratio | **Never crop artwork that contains typography** (posters, KVs). Use the asset's natural ratio (`width/height` from `media.json`), fitted inside a max box (`object-contain` on the stage; natural-ratio cards below 1024 px). No cropping at any width. | Real covers are posters with text (`ma26-design`, `post-nhat`) **O** | H |

### 4.2 Texture & image treatment

| Treatment | Where | Where **not** | Evidence | Conf. |
|---|---|---|---|---|
| Static grain (SVG `feTurbulence`, 4–6% opacity) | Paper and ink grounds, red field | On project media at rest | Grain on every mono image **O** (`07d0`, `0b3b`, `d388`, `2816`) | H |
| Horizontal motion blur / ghosting | **Type in transition only** (blur 0→8 px with slight x-offset), hero headline echo | On work images; on text at rest | `0b3b`, `8733`, `c98a`, `1c4d` **O**; Huyml metadata blur cross-fade **O** | H |
| Halftone dots | Optional: the large project counter numerals only | On photos/work | `07d0`, `4ce9`, `d388` **O** | L |
| Graphic marks | `• • •` dot rows, `01/02/03` indices, small outlined boxes, `↘` arrows, `©` | Decorative overload — max ~3 marks per viewport | `d388`, `2816` **O** | M |
| Animated grain / glitch / flashing | — | Everywhere | Accessibility (CLAUDE.md §4) | H |

### 4.3 Components

| Component | Spec | Reuse |
|---|---|---|
| **Header** | Solid paper (or ink over the work stage), no blur. Left: `PITI` wordmark. Right: About · Work · Contact as `text-xs` labels; active section marked with a 6 px red square + weight change. Mobile: existing `<dialog>` menu on ink with Inter 800 links. | `Header.tsx` (restyle) |
| **Text link** | Underline 1 px, offset 4 px; hover/focus: colour → red (ink grounds) / `--color-red-text` (paper), underline thickens to 2 px, 160 ms. | Existing pattern in `About.tsx` |
| **Primary CTA** | Label + arrow, bottom border; hover arrow shifts 4 px. Min target 44 px. | Hero "View selected work ↓" |
| **Project metadata** | Label/value pairs (`CATEGORY`, `YEAR`, `ROLE`) in label style; **unfilled values hidden** via `filled()`, never shown as brackets in production. | `site.ts` `filled()` |
| **Counter** | Anton `03` + Inter label `/ 09`; red slash. Number rolls vertically on change. | new (small) |
| **Project list (index)** | Inter 700, `text-sm` (1024–1279) / `text-base` (≥ 1280); inactive `--color-gray-on-ink`, active paper + 2 px red left edge; each row is a `<button>` that selects (scrolls to) the project. Opening is the separate "Open project →" link (§0.8). | `SelectedWork.tsx` |
| **Focus ring** | 2 px solid, red on ink / ink on paper, offset 3 px — always visible on `:focus-visible`. | Existing globals |
| **Pause control** | For any autoplaying video > 5 s. | `Gallery.tsx` Pause/Play pattern |

---

## 5. Motion specification

Tokens already exist: `--duration-fast 160ms`, `--duration-base 320ms`, `--duration-slow 640ms`, `--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-in-out cubic-bezier(.65,0,.35,1)`. **No new tokens needed.**

| Moment | Behaviour | Timing | Evidence | Conf. |
|---|---|---|---|---|
| **Loader** (first home visit per session only) | Anton count 0→100 bottom-left; thin red bar grows up the left edge; at 100 the bar widens into a full red field, then wipes up to reveal the hero. Skipped for deep links, repeat visits, reduced motion (existing gate). | count 1.2 s + wipe ≤ 0.6 s; ease-in-out | Casey 0.5–2 s loader + red bar **O**; wipe ≈ 0.6 s rise **M** | H |
| **Hero entrance** | Headline resolves from horizontal smear (blur 8 → 0, x −24 → 0); corner labels fade in, stagger 40 ms. Page usable immediately. | 640 ms / labels 320 ms | `0b3b` blur motif **O** | M |
| **Active project change** | (a) Image: clip-path reveal from bottom, outgoing image scales 1 → 0.96 and fades. (b) Metadata: blur cross-fade (6 px). (c) Counter: vertical roll. (d) List: active row gray → paper with red left edge. | (a) 640 ms ease-out (b) 320 ms (c) 320 ms (d) 160 ms; whole hand-over settles ≤ 700 ms (measured 658 ms) | Huyml: settle ≈ 1.1 s; metadata/counter blur at ~700 ms **M** — ours is faster because scroll, not a click, triggers it | H |
| **Thumbnail/list hover** | Index row → paper colour on hover/focus (no preview swap, so hover never fights scroll position). | 160 ms | Casey works index hover → red title + preview **O** (28–46 s) | M |
| **Section reveals** | Existing `RevealText` line/word reveal, once. | 320–640 ms, stagger ≤ 60 ms | Existing | H |
| **Contact hover** | Channel label → handle reveal (e.g. "Email" → address) by vertical text swap. **On touch: both always visible.** | 160–320 ms | Casey "TEXT / RING ME" 104–108 s **O** — mechanic only, not the words | M |
| **Project open** | Existing View Transition gallery-to-cover. | existing | Phase 7 | H |

**Active threshold:** a project becomes active when its scroll step crosses the viewport centre. No `scroll-snap`, no wheel interception.

### Reduced motion (`prefers-reduced-motion: reduce`)
- No loader (already gated), no wipe, no blur, no clip-path, no counter roll: changes are instant or ≤ 120 ms opacity.
- No video autoplay; poster + visible "Play video" button.
- Sticky stage remains (it is scroll-position, not animation); everything stays readable without JS animation.

### Mobile / touch (< 1024 px)
- No sticky stage: projects become stacked cards (one column < 768 px, two columns 768–1023 px; natural ratio), **title + category always visible** under each image (year/role when filled). Posters only, no autoplay. Hover effects removed; tap goes straight to the case study.
- Counter becomes a small label on each card (`03 / 09`).

### Accessibility constraints
- The index is a labelled group of buttons (`aria-current` on the active one); Enter/Space selects. "Open project" is a real link and follows the index in tab order (§0.8). Inactive stage items are `visibility:hidden`, so only the active project's text, Pause/Play and Open link are focusable/announced.
- Headings: one `h1` (name/intro), `h2` per section.
- All text contrast ≥ 4.5:1 (values in §3.1); large text ≥ 3:1.
- Alt text per project cover; decorative marks `aria-hidden`.
- No horizontal overflow at 320 px.

---

## 6. Homepage section plan

Ground rhythm: **paper → ink → paper → red** (I: alternation gives the scroll a cinematic cut without extra effects).

### 6.0 Loader — first visit only
- **Purpose:** brief identity beat. **Content:** count + "PITI".
- **Composition / motion:** §5 Loader. **Desktop = mobile.**
- **Reuse:** `Loader.tsx`, `lib/loader.ts` (restyle only).

### 6.1 Hero — paper
- **Purpose:** who, what, where to click — in under 5 s.
- **Content:** H1 "Demi Phan"; one-line role from `site.role`; disciplines list (Design · Photography · Animation · VFX · Videography · Handy craft — from `site.capabilities`, folder-derived **verified**); CTA "View selected work ↓". Corner labels: `PITI` · `Portfolio [year]` · `Scroll` · `[location?]` (placeholders until confirmed).
- **Composition:** large empty paper field framed by four corner labels; headline cols 1–8 low on the page; one vertical label on the right edge.
- **Interaction:** CTA scrolls to Work. **Motion:** §5 Hero entrance.
- **Mobile:** corner labels collapse to top/bottom rows; headline `display-lg`.
- **Reuse:** `Hero.tsx`, `RevealText`. **Removes:** `<Gallery />` from the Hero (**done** in Phase 3.1; `Gallery.tsx`, its CSS and assets are preserved for rollback). Only the CTA anchoring changed in Hero; the rest of the Hero is untouched until the full homepage phase.

### 6.2 Selected Work — ink — *signature section, Phase 3 prototype target*
- **Purpose:** discover projects, see which one is selected, move between them.
- **Content:** 9 projects from `projects.ts` (current order unless owner reorders). Cover or poster, title, category, year/role when filled.
- **Composition (desktop ≥ 1024 px):** a thin mono "Index 01—09" band marks the paper→ink edge; below it a sticky full-viewport stage (pinned scroll = 60 svh per project, equal for all nine; the active project is recomputed from geometry, so a jump past the track resolves to the first/last project).
  - Cols 1–3: "SELECTED WORK" heading (Inter 800) top; counter (Anton `03 / 09`) + title + metadata + Pause/Open actions bottom.
  - Cols 4–10: the active media in original colour, `object-contain`, never cropped — the dominant element.
  - Cols 11–12: compact index; active row paper with red left edge.
  - A closing band links to `#about`.
- **Interaction:** scroll advances the active project; selecting an index row scrolls to its step; "Open project →" goes to `/work/[slug]` (§0.8).
- **Video projects:** the first video of the project plays muted/looped **only while that project is active and the stage is on screen**, poster otherwise; one video at a time; visible Pause/Play button; no autoplay under reduced motion.
- **Motion:** §5 Active project change.
- **Below 1024 px:** stacked cards (§5 Mobile).
- **Reuse:** `projects.ts`, `media.json`, `next/image`, `lib/gsap` (ScrollTrigger is already in the stack), Pause pattern from `Gallery.tsx`, View Transition link.

### 6.3 About / Capabilities — paper
- **Purpose:** short context, not the whole CV.
- **Content:** `site.intro`; capabilities and tools; highlights **marked unverified until the resume is re-read**; websites list.
- **Composition:** two columns — left: indexed labels `01 Intro / 02 Capabilities / 03 Highlights`; right: content, max 60 ch. `• • •` mark as section opener.
- **Motion:** `RevealText` once. **Mobile:** single column.
- **Reuse:** `About.tsx` (restyle).

### 6.4 Contact — full red field
- **Purpose:** the obvious way to get in touch.
- **Content:** one large statement (owner to supply or approve wording, e.g. "Let's make something"), email, LinkedIn, Instagram — **only channels the owner confirms**. Never phone.
- **Composition:** `--color-red-field` ground with grain; statement in Inter 800 `display-xl` paper; channels as large label/handle pairs bottom-right.
- **Interaction / motion:** §5 Contact hover; touch shows everything.
- **Reuse:** `Contact.tsx` (restyle; currently ink).

### 6.5 Footer — ink strip
- `PITI`, a separate © year line, back-to-top. Existing footer markup if present in `Contact.tsx`/layout.

---

## 7. Asset & content risks

| Risk | Detail | Default handling |
|---|---|---|
| **R1 project-tet / handy-craft** | Side-by-side inspection **O**: *not a swap*. Both folders show the **same Year of the Snake (Năm Tị) desk-calendar set** — `handy-craft` holds the handmade illustration close-ups (`cover.jpg` = `handy-craft-03.jpg`, "Năm Tị Thái Bình"); `project-tet` holds photos of the finished calendars and retouched product renders (`cover.jpg` = `project-tet-01.jpg`, four calendars; `project-tet-02..05` blue calendar, snake silhouette). `handy-craft-02.jpg` (orange "Hoàng Thu Thủ Điền" calendar render) looks like it belongs with the `project-tet` renders. Each cover duplicates one of its own gallery images. | Do not change. Owner to choose: one merged project, or two (craft vs photography/retouch). |
| **R2 Resume** | `reference\resume.docx` not found. `site.ts` facts say "from the CV" but cannot be re-verified now. | Keep, label unverified in About until re-read. |
| **R3 Placeholders** | Every project's year, role, description, context, process, result is `[...]`. | Hidden in production via `filled()`; visible only in dev. |
| **R4 Video-only projects** | `animation`, `vfx`, `videography` have `cover: null`. The stage needs a poster frame. | **Done.** Poster frames extracted with the existing Edge/Playwright setup (§0.6). Owner may swap any frame. |
| **R5 Third-party likeness** | `post-nhat` cover is a named judge's portrait. | Confirm it is OK to feature, or pick another cover. |
| **R6 Large files** | `recap-10-nam-ma.mov` (288.7 MB), `ma26-ooh-pho-di-bo.mp4` (53.2 MB) are git-ignored and not on the site. | Leave out unless the owner provides compressed versions. |

---

## 8. Questions for the owner (one round)

Each has a default; reply "defaults" to accept all.

1. **Approve D1–D7?** (original colours, two red-field moments, natural-scroll index, one loader wipe, naming, placeholder contacts, retire Gallery from homepage) — *Default: approve all.*
2. **Naming:** "Demi Phan" as the name and "PITI" (no ©) as the wordmark — *answered in §0.3.*
3. **Tết calendar (R1):** one project or two? — *Default: keep two, rename `handy-craft` → "Năm Tị calendar — handmade" and `project-tet` → "Năm Tị calendar — photography & retouch"; move `handy-craft-02.jpg` to `project-tet`.*
4. **Typography:** Inter 800 headlines, Anton for selected numerals, restrained monospace for small labels — *answered in §0.5.*
5. **Contact:** which channels and URLs are public? — *Default: email + LinkedIn + Instagram, placeholders until you send them; never phone.*
6. **Resume:** save it to `reference\resume.docx` (or give its path) so highlights can be re-verified before Phase 4 — *Default: proceed with Phase 3 now; verify before About is finalised.*

---

## 9. Acceptance criteria — Phase 3 prototype (Selected Work stage only)

Review against a real render at **1440×900, 1024×768, 390×844**. No numerical "similarity" score; each item is pass/fail by observation.

**Art direction**
- [ ] Every project image renders in its original colours — no duotone, tint, grain or blur on media at rest.
- [ ] Interface uses only ink, paper, gray and red tokens; red covers ≤ ~5% of the stage viewport.
- [ ] Headline/titles in Inter 800 tight; counter in Anton; labels in uppercase `text-xs` tracked.
- [ ] Grain is visible on the ink ground and not on images.
- [ ] Posters with typography are never cropped.

**Interaction**
- [ ] Scrolling with wheel, trackpad, keyboard and scrollbar all behave natively (no captured wheel, no snap).
- [ ] Exactly one project is active at a time; image, counter, list highlight and metadata always agree.
- [ ] Selecting an index row (click, Enter, Space) moves to that project; "Open project →" opens `/work/[slug]`; no control does both.
- [ ] Tab order: index buttons → Pause/Play (video projects) → Open project; focus ring visible on all.
- [ ] Below 1024 px: stacked cards (two columns from 768 px) with title + category visible without hover; the Gallery does not render anywhere on the homepage.

**Motion**
- [ ] Active change completes in ≤ 700 ms; nothing blocks interaction while animating.
- [ ] With reduced motion emulated: no blur, clip, roll or video autoplay; content fully readable.
- [ ] Video projects play only while active and on screen (one at a time) and have a working Pause/Play control; under reduced motion they never start on their own.

**Quality**
- [ ] No horizontal overflow at 320 px; no overlapping text at any tested width.
- [ ] `npm run build` and `npm run lint` pass; zero console errors.
- [ ] Unfilled placeholder fields are hidden in a production build.
