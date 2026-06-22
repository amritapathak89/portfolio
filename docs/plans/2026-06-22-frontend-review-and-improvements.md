# Portfolio — Frontend Review & Improvement Plan (Tailwind era)

> **Date:** 2026-06-22
> **Branch reviewed:** `original-site` (now converged with `master`'s Tailwind v4 pipeline)
> **Scope:** Static frontend only — `frontend/public/{index.html,script.js}`, `frontend/src/input.css`, build/tooling.
> **Status:** Plan only. Implementation deferred to a later phase.

---

## 0. Why this plan supersedes the 2026-06-18 one

The previous review ([2026-06-18-code-review-and-hardening.md](./2026-06-18-code-review-and-hardening.md))
described a pre-Tailwind site with an Express/MySQL backend and hand-written
`style.css`. **None of that matches the current tree:**

- Backend is gone (removed 2026-06-18) — every backend, npm-audit, CORS, helmet,
  and rate-limit finding in the old plan is moot.
- `style.css` no longer exists. Styling is **Tailwind v4** utilities in
  `index.html` + tokens/keyframes in `frontend/src/input.css`, compiled to the
  generated `output.css`.
- Bootstrap 4/5, jQuery, Font Awesome are all **already removed**. The only CDN
  assets left are **Bootstrap Icons** and **Google Fonts (Oswald)**.
- The `</hé>` tag, copy-pasted `alt` text, inline `style="width:18rem"`,
  carousel `aria-label`s, canvas-context caching, tab-hidden pause — **all
  already fixed** in the live file.

So the old plan's findings are either resolved or describe files that no longer
exist. This document is a **fresh review of the code as it stands today** and
keeps only what is genuinely still open.

---

## 1. Executive summary

The site is a clean, single static page built with Tailwind v4 + vanilla JS.
It is in good shape. Remaining work is **content correctness, SEO/accessibility
semantics, image-weight performance, and JS/tooling polish** — no security-critical
items beyond CDN SRI.

| # | Issue | Severity | Area |
|---|-------|----------|------|
| 1 | Content bugs: skills-bar label/width mismatch, duplicated HDM card text, typos | 🟠 Med | Correctness |
| 2 | 6 dead `View Project` links (`href="#"`) + dead Facebook link | 🟠 Med | Correctness / UX |
| 3 | ~9 `<h1>` on one page — broken heading hierarchy | 🟠 Med | SEO / a11y |
| 4 | Unoptimised images — 8.7 MB total; 600–924 KB PNGs rendered at ~288 px | 🟠 Med | Performance |
| 5 | No intrinsic `width`/`height` on content images → layout shift (CLS) | 🟡 Low | Performance |
| 6 | No SRI on Bootstrap-Icons CDN `<link>` | 🟡 Low | Supply chain |
| 7 | SEO gaps: no `og:image`, no Twitter card, no `robots.txt`/`sitemap.xml` | 🟡 Low | SEO |
| 8 | No `prefers-reduced-motion` guard for slide-in / skill-bar animations | 🟡 Low | a11y |
| 9 | `script.js`: 5 separate `DOMContentLoaded` blocks, implicit globals, convoluted resize debounce | 🟡 Low | Quality |
| 10 | Stale `Readme.md` (still describes Bootstrap CDN + `style.css`) | 🟡 Low | Docs |
| 11 | No lint/format/CI; no favicon variants | 🟢 Opt | Tooling |

---

## 2. Findings by area

### 2.1 Content correctness (`index.html`)

- 🟠 **Skills-bar label vs fill mismatch.** "HTML, CSS & Bootstrap, Tailwind"
  shows **95%** ([index.html:387](../../frontend/public/index.html#L387)) but the
  bar fills to `--final-width: 90%` ([:389](../../frontend/public/index.html#L389)).
  Pick one number for both.
- 🟠 **Duplicated sentence fragment** in the HDM card:
  "A fully functional mobile and desktop version of a logistics app / A fully
  functional mobile" ([index.html:222-223](../../frontend/public/index.html#L222-L223)).
  Drop the stray second line.
- 🟠 **Typos:** "minimilstic" → "minimalistic"
  ([:200](../../frontend/public/index.html#L200)); "Netowrk" → "Network"
  ([:340](../../frontend/public/index.html#L340)); "AVI, MP4n MOV" → "AVI, MP4, MOV"
  ([:245](../../frontend/public/index.html#L245)).
- 🟠 **Dead `View Project` links.** Six project cards link to `href="#"`
  (Just Homes, PDF utility, WikiStage, Travaux Decor, Brasserie, HDM, Video
  Converter). Either point to a real URL/case-study, or render those cards
  without an active link (so a recruiter doesn't click into nothing).
- 🟠 **Dead Facebook link** in the footer — `href="#"`
  ([:442](../../frontend/public/index.html#L442)). Link it or remove the icon.

### 2.2 SEO & semantics

- 🟠 **Heading hierarchy.** The page has roughly **nine `<h1>`s** ("Designer",
  "Coder", "About Me", "Strengths…", "Traits…", "Education", "Experience",
  "Skills", "Get in touch"). There should be exactly **one `<h1>`** (the page/
  hero title); everything else demotes to `<h2>`/`<h3>`. Since `@layer base`
  maps heading sizes by tag ([input.css:42-61](../../frontend/src/input.css#L42)),
  keep the *visual* size by adding the matching utility classes where the tag
  changes, so the redesign is purely semantic.
- 🟡 **Missing social/preview meta:** no `og:image`, no `og:type`, no
  `twitter:card`/`twitter:image`. Add an OG image (1200×630) so shared links
  render a card.
- 🟡 **No `robots.txt` / `sitemap.xml`.** Add both under `frontend/public/` for
  a single-page site (trivial, helps indexing).
- 🟡 **`<hr>` elements carry the scroll-anchor IDs** (`about-me-section`,
  `contact-page-section` on `<hr>` tags). Works, but the anchor lands on a rule,
  not the section. Prefer moving the `id` onto the relevant `<section>`.

### 2.3 Performance — images (highest-impact remaining win)

`frontend/public/assets/images` is **8.7 MB across 43 files**. Worst offenders:

| File | Size | Rendered at |
|---|---|---|
| `brasseire-project/menu.png` | 924 KB | ~288 px card |
| `justhomes/homepage.png` | 836 KB | ~288 px card |
| `brasseire-project/home.png` | 836 KB | ~288 px card |
| `travaux-decor/home.png` | 732 KB | ~288 px card |
| `cooking.jpg` | 604 KB | 70–200 px |
| `creativity.jpg` | 572 KB | 70–200 px |

- 🟠 **Convert to WebP/AVIF** and downscale to the actual rendered size.
  Carousel images render in a `w-[18rem]` (≈288 px) card at `h-[200px]`; serving
  them at ~600 px wide WebP cuts each by **~80–90%**. Expect the 8.7 MB to drop
  to well under 1 MB.
- 🟠 **Generate `srcset`/`sizes`** for the few large above-the-fold images
  (hero, About-Me portrait) so retina gets 2× and mobile gets a small file.
- ✅ `loading="lazy"` + `decoding="async"` are **already present** on the
  carousel/below-fold images — keep them.
- **Tooling note:** this needs an image step (e.g. `sharp`/`squoosh`/`cwebp`).
  Decide: a one-off conversion committed to the repo, or a `make images` target.
  Recommend a committed `assets/images/**.webp` set + `<picture>` fallback, since
  there is no bundler.

### 2.4 Performance — render path & runtime (`script.js`)

- 🟡 **No intrinsic `width`/`height`** on content images (carousel, hobby,
  strengths). They rely on `h-[200px]`/`object-cover`, so the browser reserves
  no box until load → cumulative layout shift. Add `width`/`height` attributes
  (or aspect-ratio) matching the rendered box.
- ✅ Scripts already `defer`; canvas context already cached; starfield already
  pauses on tab-hidden ([script.js:117-124](../../frontend/public/script.js#L117)).
- 🟡 **Resize debounce is convoluted** ([script.js:20-34](../../frontend/public/script.js#L20)) —
  mixes a `lastResizeTime` cooldown with a `setTimeout`, and the `Date.now()`
  guard is hard to follow. Replace with a plain trailing debounce
  (`clearTimeout` + single `setTimeout`).
- 🟡 **Five separate `DOMContentLoaded` listeners** (carousel, card-reveal,
  hobby, skills, email). Consolidate into one `ready()`/`DOMContentLoaded`
  init function for clarity and one fewer event pass.
- 🟡 **Implicit/explicit globals** — `canvas`, `ctx`, `stars`, `navToggle`,
  `navLinks`, etc. all sit on module scope. Wrap the file in an IIFE (or mark it
  a module) to avoid leaking into `window`.

### 2.5 Accessibility

- 🟡 **`prefers-reduced-motion`.** The hero starfield was deliberately left
  always-on (a previous guard froze it — documented in the old plan). But the
  **card slide-ins** (`-translate-x-full` → `translate-x-0`), **`slideInOut`**,
  and **`fillBar`** animations have no reduced-motion escape hatch. Add a
  `@media (prefers-reduced-motion: reduce)` block in `input.css` that disables
  *those* transitions/animations (reveal content instantly) while leaving the
  starfield untouched.
- 🟡 **Carousel a11y.** Buttons have `aria-label` (good), but there's no
  `aria-live`/`aria-roledescription="carousel"` region and no keyboard arrow
  support beyond tabbing to the buttons. Optional: add a `role="group"` +
  live-region announcement of the current slide.
- 🟡 **Generic `alt`** on a couple of decorative images (`alt="logo"`,
  `alt="girl-coder"`). Minor — make them descriptive or mark purely decorative
  ones `alt=""`.

### 2.6 Supply chain

- 🟡 **SRI on the Bootstrap-Icons CDN `<link>`**
  ([index.html:7](../../frontend/public/index.html#L7)) — add `integrity` +
  `crossorigin`, or self-host the icon font + CSS. Google Fonts can't take a
  stable SRI (rotating CSS), so leave it or self-host Oswald. Self-hosting both
  also removes 2 third-party round-trips (perf bonus).

### 2.7 Docs & tooling

- 🟡 **`Readme.md` is stale** — per `AGENTS.md`'s own gotcha, it still mentions
  Bootstrap CDN + `style.css`. Rewrite to match the Tailwind-v4 / `output.css`
  reality (AGENTS.md is already correct; mirror it).
- 🟢 **No favicon variants** — only `favicon.ico`. Add `apple-touch-icon.png`
  and a 32×32 PNG + a tiny `site.webmanifest` if PWA-ish polish is wanted.
- 🟢 **No lint/format/CI.** Optional: Prettier + a minimal `.editorconfig`, and
  a GitHub Action that runs `npm run build` and checks `output.css` is in sync
  (catches "forgot to rebuild" drift, which AGENTS.md warns about).

---

## 3. Proposed phased roadmap

> `[ ]` pending. Each phase is independently shippable. Phases A–B are
> no-tooling edits; C–D need an image/lint pipeline decision.

> **Implemented 2026-06-22.** See checkbox state below. Dead links deliberately
> left for the site owner to fill. SRI and the Phase-D optional items were
> completed in a follow-up pass later the same day (notes inline). Only the dead
> links and `srcset`/`sizes` (a reasoned no-op — no retina sources) remain open.

### Phase A — Content & correctness (no tooling, fast, high signal)
- [x] Fix skills-bar 95%/90% mismatch (bar now fills 95%).
- [x] Remove duplicated HDM card line.
- [x] Fix typos ("minimilstic", "Netowrk", "MP4n").
- [ ] Resolve the 6 dead `View Project` links + Facebook link — **left for the
      owner to fill** (per request, 2026-06-22).
- [x] Demote the extra `<h1>`s to `<h2>` (kept visual size via explicit classes);
      added one `sr-only` `<h1>` page title. Page now has exactly one `<h1>`.

### Phase B — SEO, a11y & supply chain (HTML/CSS only)
- [x] Added `og:image`/`og:image:width`/`height`, `og:type`, and Twitter-card
      meta; generated a 1200×630 `assets/images/og-image.jpg`.
- [x] Added `robots.txt` + `sitemap.xml` under `public/`.
- [x] Moved scroll-anchor IDs from `<hr>` onto their `<section>`s.
- [x] Added `prefers-reduced-motion` guard in `input.css` for card/slide-in/
      skill-bar animations (starfield left on by design).
- [x] SRI on the Bootstrap-Icons CDN asset — added `integrity`
      (`sha384-Ay26V7L8…`, computed from the live `@1.10.5` CSS, byte-stable
      across re-fetches) + `crossorigin="anonymous"`. Google Fonts still left
      bare (rotating CSS can't take a stable SRI).
- [x] Added intrinsic `width`/`height` to all content images (carousel, hobby,
      portrait, hero, illustration) to cut CLS.

### Phase C — Image performance
- [x] Converted all referenced screenshots/photos to WebP, downscaled to render
      size (work cards ≤600 px, photos ≤400 px) and swapped `src` to `.webp`.
      Went **WebP-direct** rather than `<picture>` + fallback — WebP is
      universally supported now and it keeps the markup clean. Originals kept on
      disk. **Image weight: 8.7 MB → ~0.44 MB** (target < 1 MB met).
- [ ] `srcset`/`sizes` for hero + portrait — not needed after the downscale;
      revisit only if true retina source variants are wanted.

### Phase D — JS & tooling polish
- [x] Wrapped `script.js` in an IIFE; consolidated the 5 `DOMContentLoaded`
      blocks into one `ready()` init; no more `window` globals.
- [x] Replaced the convoluted resize logic with a plain trailing debounce.
- [x] Rewrote `Readme.md` to the Tailwind reality.
- [x] Carousel keyboard/aria-live — multi-image carousels are now `role="group"`
      + `aria-roledescription="carousel"`, focusable (`tabindex="0"`), driven by
      ←/→ keys, with an `aria-live="polite"` "Image N of M" status. Single-image
      cards left untouched.
- [x] Prettier + `.editorconfig` — added `.editorconfig`, `.prettierrc.json`,
      `.prettierignore` (skips generated `output.css` + binary assets), `prettier`
      devDep, and `make format` / `make format-check` targets (run from repo root
      so the root config/ignore apply). Existing files not bulk-reformatted to
      keep the diff reviewable.
- [x] CI — added `.github/workflows/ci.yml`. The original "build-sync" check is
      moot now that `output.css` is git-ignored, so CI instead runs
      `npm ci && npm run build` and asserts `output.css` is produced (catches
      `input.css`/token/keyframe breakage).
- [x] Favicon variants + `site.webmanifest` — generated `apple-touch-icon.png`
      (180), `favicon-16x16`/`favicon-32x32` (crisp, native ico sizes) and
      `icon-192.png` from `favicon.ico`; wired `<link>`s + `theme-color` and added
      `site.webmanifest`. Source ico maxes at 48 px, so the large icons are soft
      — replace with a vector-sourced set if a sharper mark is wanted.

---

## 4. Out of scope / non-issues (verified good — leave alone)

- No backend, no network calls, no secrets — nothing to harden server-side.
- Bootstrap/jQuery/Font Awesome already removed; only Bootstrap-Icons + Oswald
  remain on CDN.
- Scripts already `defer`; canvas context cached; starfield pauses on tab-hidden;
  carousel buttons have `aria-label`; below-fold images already lazy/async.
- `output.css` is generated — never hand-edit; rebuild via `make build`.

---

## 5. Verification commands used
```bash
git branch -a                                   # confirm original-site ≈ master (Tailwind)
ls frontend/public frontend/src                 # index.html, output.css, script.js, input.css
du -sh frontend/public/assets/images            # 8.7M
find …/assets/images -size +200k | sort -rh     # heaviest PNG/JPG offenders
grep -n 'href="#"' frontend/public/index.html   # dead links
grep -n '<h1'       frontend/public/index.html   # heading-hierarchy audit
```
