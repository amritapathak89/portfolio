# Portfolio Website — Code Review, Improvement & Hardening Plan

> **Date:** 2026-06-18
> **Branch reviewed:** `original-site`
> **Reviewer:** Engineering review (automated analysis)
> **Scope:** Full application — `frontend/` (static HTML/CSS/JS) and `backend/` (Node.js/Express/MySQL)

---

> ## 🔄 Updates — 2026-06-18 (post-review)
> **1. Contact form → static email.** Replaced with an obfuscated email (`Email: *****@gmail.com` + reveal-on-hover/tap tooltip). See [2026-06-18-contact-section-to-email.md](./2026-06-18-contact-section-to-email.md).
> **2. Backend removed.** The `backend/` Express/MySQL service has been **deleted** — the project is now a **pure static frontend**. This resolves *all* backend findings by removal: the **5 npm vulnerabilities** (§6.1), the **CORS / input-validation / rate-limiting / helmet** hardening (§6.2), and the entire **§3.1 Backend** review. Those sections are kept below for history, marked **✅ Resolved by removal**.
> **Remaining active scope is frontend-only** — summary items 7–9 and §3.2 / §3.3 / §5. Resolved items are struck through and marked **✅ Resolved (2026-06-18)**.

---

## 1. Executive Summary

This is a small personal-portfolio website. **As of 2026-06-18 it is a pure static frontend** (plain HTML/CSS/vanilla JS) served by Apache from `/var/www/html`. *(It originally bundled a minimal Express/MySQL backend for a contact form; both the form and the backend have since been removed — see the update banner above.)*

The code is small, readable, and the one piece of database code already uses **parameterised queries** (good — no SQL injection on the insert). However, the project is at a "works on my machine" stage and is **not production-ready**. The most important issues are:

| # | Issue | Severity | Area |
|---|-------|----------|------|
| 1 | ~~Contact form has **no rate limiting / anti-spam**~~ — **✅ Resolved (2026-06-18):** form removed (now a static email); endpoint no longer reachable from the site | ✅ | Security |
| 2 | ~~Frontend calls a **hardcoded `http://localhost:8000`**~~ — **✅ Resolved (2026-06-18):** the `fetch` call was removed with the form | ✅ | Correctness |
| 3 | ~~**CORS is fully open**~~ — **✅ Resolved by backend removal (2026-06-18)** | ✅ | Security |
| 4 | ~~**No input validation / size limits**~~ — **✅ Resolved by backend removal (2026-06-18)** | ✅ | Security |
| 5 | ~~**5 npm vulnerabilities (3 high)**~~ — **✅ Resolved by backend removal (2026-06-18):** `backend/` + `node_modules` deleted | ✅ | Supply chain |
| 6 | ~~**No security headers** (no `helmet`)~~ — **✅ Resolved by backend removal (2026-06-18)** | ✅ | Security |
| 7 | Duplicate/conflicting **Bootstrap 4 + Bootstrap 5** and unused, outdated **jQuery 3.2.1** loaded from CDNs | 🟠 Medium | Perf / Security |
| 8 | Unoptimised images, render-blocking assets, always-on canvas animation | 🟡 Medium | Performance |
| 9 | Malformed HTML (`</hé>`), wrong `alt` text, dead `constants.js`, no `npm` scripts | 🟡 Low | Quality |

After the 2026-06-18 changes (contact form → static email; backend deleted), items **1–6 are resolved**. The **remaining active findings are frontend-only** — items 7–9: redundant CDN libraries, image/render performance, and assorted HTML/CSS/JS quality issues.

> **Note on branches:** `git log --all` shows a more advanced line of work on other branches (`master`) — Tailwind build pipeline, email obfuscation, SEO meta, lazy loading, asset pruning. Several items below may already be addressed there. This review is scoped to **`original-site`** as requested; where relevant, "converge with `master`" is called out.

---

## 2. Architecture Overview

```
portfolio/                            # Pure static frontend (backend removed 2026-06-18)
├── Readme.md
├── docs/plans/                       # this review + the change plans
└── frontend/public/
    ├── index.html                    # single-page portfolio
    ├── style.css                     # hand-written CSS
    ├── script.js                     # starfield, carousel, scroll animations, email tooltip
    └── assets/images/                # ~40 PNG/JPG screenshots + SVGs (unoptimised)
```

**Architecture (current):** a single static page (`index.html` + `style.css` + `script.js`) served directly by Apache from `/var/www/html`. **No backend, no build step, no network calls.**
> *Originally* the page POSTed a contact form to an Express endpoint (`/submit-form` → MySQL). Both the form and the backend were removed on 2026-06-18.

---

## 3. Code Review — Findings by Area

### 3.1 Backend — ✅ Resolved by removal (2026-06-18)

> `backend/` has been **deleted**. The findings below are retained for history only (useful if a backend is ever reintroduced) and need no action.

#### 3.1.1 `server.js`
- **Missing `PORT` fallback** — `const PORT = process.env.APP_SERVER_PORT;` ([backend/server.js:11](../../backend/server.js#L11)). If the env var is unset, `app.listen(undefined)` binds a **random** port and the startup log prints `http://localhost:undefined`. Add a default (`|| 8000`) and validate required env at boot.
- **Redundant `body-parser` dependency** — Express ≥ 4.16 ships `express.json()` / `express.urlencoded()` built in. `body-parser` ([backend/server.js:2,14-15](../../backend/server.js#L14)) can be dropped.
- **Open CORS** — `app.use(cors())` ([backend/server.js:16](../../backend/server.js#L16)) allows **any** origin. Restrict to the production origin(s). *(See §5.)*
- **Duplicate `/` handling** — `app.use("/", apiRoutes)` ([:19](../../backend/server.js#L19)) and `app.get("/", …)` ([:22-24](../../backend/server.js#L22)) overlap. Harmless today (apiRoutes only defines `POST /submit-form`) but confusing; consider a dedicated `/health` route instead of the "Backend is working!" string.
- **No global error handler, no graceful shutdown, no structured logging** — only `console.error`. For anything beyond local dev, add an error-handling middleware and a `process` signal handler that drains the pool.

#### 3.1.2 `config/db.js`
- **Legacy `mysql` driver** — uses the **unmaintained** `mysql` v2 package ([backend/config/db.js:1](../../backend/config/db.js#L1)) even though `mysql2` (modern, maintained, promise-capable, faster, more secure) is *also* installed. Standardise on **`mysql2/promise`** and remove `mysql`.
- **No connection-pool limits** — `createPool` ([:6-12](../../backend/config/db.js#L6)) sets only `connectTimeout`. Add `connectionLimit`, `queueLimit`, and `enableKeepAlive`.
- **No env validation** — if `MYSQL_*` vars are missing, failures surface only at first query. Fail fast at startup.

#### 3.1.3 `src/routes/submit-form.routes.js`
- ✅ **Good:** parameterised query ([backend/src/routes/submit-form.routes.js:14-15](../../backend/src/routes/submit-form.routes.js#L14)) prevents SQL injection.
- **No validation** of `name/email/company/phone/message` ([:6](../../backend/src/routes/submit-form.routes.js#L6)) — no presence checks, no length caps, no email-format check. Undefined fields are inserted as `NULL`/empty; oversized strings can be inserted up to column limits or error out.
- **Callback-style nesting** — readable now, but migrating to `async/await` with `mysql2` removes the manual `getConnection`/`release` and the double error path.
- **Leaks DB errors to logs verbosely** — fine for dev; ensure production logs don't echo full driver errors to clients (currently it returns generic messages — ✅ good — but logs the raw error).

#### 3.1.4 `package.json`
- **No `name`, `version`, `scripts`, or `engines`** — cannot `npm start`; no pinned Node version.
- **Unused / misplaced dependencies:** `@babel/core`, `@babel/node`, `@babel/preset-env` (no ESM/JSX anywhere — the source is CommonJS), and **`axios`** (not imported in any backend file). These four pull in the **entire** set of reported vulnerabilities. Remove them. *(Verified: `grep` finds no `axios`/`babel`/`import`/`export` usage in `src/`, `server.js`, `config/`.)*
- **Two MySQL drivers** (`mysql` + `mysql2`) — keep only `mysql2`.

### 3.2 Frontend

#### 3.2.1 `index.html`
- 🔴 **Broken closing tag** — line 68 ends with `</hé>` instead of `</p>` ([frontend/public/index.html:68](../../frontend/public/index.html#L68)). Malformed markup.
- 🔴 **Conflicting CSS frameworks** — loads **Bootstrap 5.0.2** ([:7](../../frontend/public/index.html#L7)) *and* **Bootstrap 4.1.1** ([:12](../../frontend/public/index.html#L12)). Two major versions fight over the same class names. Pick one (5.x) and delete the other.
- 🟠 **Outdated, unused jQuery 3.2.1** ([:15](../../frontend/public/index.html#L15)) loaded from CDN. `script.js` deliberately re-implements `ready()` ("you-might-not-need-jquery"), so jQuery is **dead weight** — and 3.2.1 has known CVEs (e.g. prototype pollution, CVE-2019-11358). Remove it.
- 🟠 **Redundant icon libraries** — both **Bootstrap Icons** ([:8](../../frontend/public/index.html#L8)) and a **Font Awesome kit** ([:16](../../frontend/public/index.html#L16)) load, but the footer only uses `bi-*` (Bootstrap Icons) classes. Drop Font Awesome.
- 🟠 **Missing Subresource Integrity (SRI)** on jQuery, Bootstrap 4 CSS, and the Font Awesome kit (Bootstrap 5 CSS/JS do have `integrity`). Any CDN-served script without SRI is a supply-chain risk.
- 🟡 **Copy-pasted / wrong `alt` text** — most project screenshots use `alt="Justhomes-homepage"` regardless of content ([:126-238](../../frontend/public/index.html#L126)). Hurts accessibility & SEO.
- 🟡 **Inline styles** — `style="width: 18rem;"` repeated on every card; move to a class.
- 🟡 **Non-semantic carousel controls** — `<button>…<</button>` / `>` ([:87-88](../../frontend/public/index.html#L87)) have no `aria-label`; screen readers announce "less-than".
- ~~🟡 **Inputs:** phone uses `type="text"`…~~ **✅ Resolved (2026-06-18):** the form and its inputs were removed; replaced by a static email + tooltip.

#### 3.2.2 `script.js`
- ✅ **Resolved (2026-06-18) — Hardcoded API endpoint** — the `fetch("http://localhost:8000/submit-form")` call was **removed** along with the contact form (see [2026-06-18-contact-section-to-email.md](./2026-06-18-contact-section-to-email.md)). The page no longer makes any network request, eliminating the production-breakage and mixed-content issues.
- 🟡 **`delete resizeTimeout`** ([:15](../../frontend/public/script.js#L15)) — `delete` on a `let` binding is a no-op (and invalid in strict mode). Use `clearTimeout(resizeTimeout); resizeTimeout = null;`.
- 🟡 **`ms` used before declaration** — referenced at [:28](../../frontend/public/script.js#L28) but declared at [:87](../../frontend/public/script.js#L87) (`let ms = 16`). Works only because the `requestAnimationFrame` branch short-circuits before the TDZ access; fragile.
- 🟡 **`alert()` for feedback** ([:270,273,278](../../frontend/public/script.js#L270)) — blocking and dated UX; replace with inline status / toast.
- 🟡 **Globals** — `canvas`, `stars` are implicit/explicit globals; wrap in a module/IIFE.
- 🟡 **No client-side validation messaging** beyond native `required`.

#### 3.2.3 `style.css`
- 🟡 **Duplicate rule** — `.card-container { overflow: hidden; width: 100%; }` is declared twice ([frontend/public/style.css:215-223](../../frontend/public/style.css#L215)).
- ~~🟡 **Contact form `opacity: 0.6`** dims the entire form…~~ **✅ Resolved (2026-06-18):** the form styles were removed along with the form.
- 🟡 No `prefers-reduced-motion` guard for the many animations (starfield, slide-ins, skill bars).

### 3.3 Project-wide / Tooling
- **Dead file** — `frontend/src/shared/constants.js` is empty (0 bytes).
- **No linting/formatting** — no ESLint, Prettier, or `.editorconfig`.
- **No tests** and **no CI**.
- **Sparse README** — `Readme.md` lists the stack but omits: required env vars, how to create the `contact_form` table, run commands, and port config.
- **No DB schema/migration** — the `contact_form` table must be created by hand; its definition lives nowhere in the repo.
- **No deployment artefacts** — no Dockerfile / compose / process manager config; deployment steps are undocumented.
- ✅ **Secrets hygiene is OK** — `.env` is git-ignored and **not** committed; only `.env.example` appears in history. Confirmed no credentials in tracked files.

---

## 4. Improvement Opportunities

Grouped by theme; each row notes rough **effort** and **impact**.

### 4.1 Correctness & DX (do first)
| Improvement | Effort | Impact |
|---|---|---|
| ~~Make the form's API URL relative / configurable~~ — ✅ Resolved 2026-06-18 (form removed) | — | ✅ |
| Fix `</hé>` tag, duplicate Bootstrap, dead jQuery/FA, duplicate CSS rule | S | High |
| Add `name`, `version`, and `scripts` (`start`, `dev`) to `package.json` | S | Med |
| Add `.env.example` + startup env validation (fail fast) | S | Med |
| Commit a `schema.sql` (or migration) for `contact_form` | S | Med |
| Delete dead `constants.js` and unused deps (`axios`, `@babel/*`, `mysql`) | S | Med |

### 4.2 Robustness — ✅ Resolved by removal (2026-06-18)
All four were backend/form concerns; with the backend and form gone they no longer apply: ~~migrate to `mysql2/promise`; request validation + size cap; error handler / `/health` / graceful shutdown; replace `alert()`~~.

### 4.3 Tooling & Process
| Improvement | Effort | Impact |
|---|---|---|
| Add ESLint + Prettier + `.editorconfig` | S | Med |
| Add a GitHub Actions CI (lint, `npm audit`, build) | M | Med |
| Add a Dockerfile / docker-compose (app + MySQL) for reproducible deploys | M | Med |
| Add a smoke/integration test for `POST /submit-form` (e.g. supertest) | M | Med |
| ~~Expand README (env, DB setup, run, deploy)~~ → README rewritten to "frontend-only" (2026-06-18) | — | ✅ |

> **Note (2026-06-18):** the backend-specific tooling rows above — *GitHub Actions `npm audit`*, *Docker (app + MySQL)*, *supertest for `POST /submit-form`* — are now **N/A**. ESLint / Prettier / `.editorconfig` remain optional for the static site.

### 4.4 Optional / Product
- Email notification on submission (e.g. `nodemailer`) so messages aren't only in the DB.
- Honeypot field + server-side spam scoring or a CAPTCHA (pairs with rate limiting in §5).
- Converge this branch with the more advanced `master` (Tailwind build, lazy loading, SEO, email obfuscation) rather than maintaining two divergent frontends.

---

## 5. Performance Boosting Opportunities

The page pulls **several large render-blocking CDN libraries it doesn't need** and ships **unoptimised raster images**. Biggest wins are removing redundant libraries and optimising images.

### 5.1 Network / Asset weight (highest impact)
1. **Remove redundant libraries** — deleting Bootstrap 4.1.1, jQuery 3.2.1, and the Font Awesome kit removes **3 render-blocking requests** plus their bytes, with **zero** functional loss (none are used). *Single biggest, lowest-risk win.*
2. **Optimise images** — ~40 PNG/JPG screenshots are served at full size:
   - Convert screenshots to **WebP/AVIF** (typically 60–80% smaller than PNG).
   - Generate responsive sizes + `srcset`/`sizes`; the cards render at ~288px wide but may ship multi-MB source images.
   - Add `loading="lazy"` and `decoding="async"` to below-the-fold/carousel images (carousel holds 4–5 images per card × 7 cards — most are off-screen at load).
3. **Self-host critical CSS/fonts** or at least add `defer`/`async` and preload, to cut third-party round-trips and layout shift.

### 5.2 Render path
4. **Defer scripts** — move/`defer` the Bootstrap JS and `script.js`; none are needed before first paint.
5. **Minify** local `style.css` and `script.js` (or adopt a small build step / converge with `master`'s pipeline).
6. **Enable compression & caching at the web server** — gzip/brotli + long-lived `Cache-Control` for hashed static assets (Apache `mod_deflate`/`mod_expires`). Document this in the repo.

### 5.3 Runtime / JS
7. **Pause the starfield when off-screen / tab hidden** — `paintLoop` runs `requestAnimationFrame` continuously ([frontend/public/script.js:89-98](../../frontend/public/script.js#L89)), burning CPU/battery even when the hero is scrolled away. Add `document.visibilitychange` handling and/or an `IntersectionObserver` on `#background` to stop/start.
8. **Cache the canvas 2D context** — each `Star` calls `canvas.getContext("2d")` in its constructor ([:39](../../frontend/public/script.js#L39)); fetch it once and share.
9. **Respect `prefers-reduced-motion`** — skip the starfield and slide-in animations for users who request reduced motion (perf + accessibility).
10. **Debounce correctly on resize** — the current resize handler re-initialises stars on every settle; the `delete resizeTimeout` bug means the debounce doesn't fully work.

### 5.4 Backend — ✅ Resolved by removal (2026-06-18)
~~Pool tuning / `compression` middleware~~ — no longer applicable; the backend has been deleted.

---

## 6. Security Vulnerability Scan & Hardening

> ✅ **Resolved by backend removal (2026-06-18):** §6.1 and §6.2 were backend concerns. With `backend/` (and its `node_modules`) deleted, the **5 npm advisories are gone** and the server-hardening checklist (CORS, helmet, rate-limit, validation) is **no longer applicable**. Retained for history. Still relevant to the static frontend: **SRI on CDN assets** (§3.2.1) and **`.git/` / webroot exposure** (note at end of §6.3).

### 6.1 Dependency scan (`npm audit`, backend) — ✅ Resolved by removal

```
5 vulnerabilities (2 moderate, 3 high)
```

| Package | Severity | Advisory | Reachable at runtime? |
|---|---|---|---|
| `@babel/plugin-transform-modules-systemjs` | **High** | GHSA-fv7c-fp4j-7gwp (arbitrary code gen) | No — `@babel/*` is unused |
| `picomatch` | **High** | GHSA-3v7f-55p6-f55p, GHSA-c2c7-rcm5-vvqj (ReDoS) | No — transitive via babel/axios |
| `form-data` | **High** | (unsafe random boundary) | No — transitive via `axios` |
| `@babel/helpers` | Moderate | GHSA-968p-4wvh-cqc8 (ReDoS) | No |
| `postcss` | Moderate | GHSA-qx2v-qp2m-jg93 (XSS in stringify) | No |

**Key insight:** every reported vulnerability comes from **dependencies that are not used by the application** (`@babel/core`, `@babel/node`, `@babel/preset-env`, `axios`). **Removing those four packages eliminates all 5 advisories** without `npm audit fix` and without touching runtime code.

```bash
cd backend
npm uninstall @babel/core @babel/node @babel/preset-env axios mysql
npm audit          # expect: 0 vulnerabilities
```

> **Frontend client-side libs** are not covered by `npm audit` (no `package.json`). jQuery 3.2.1 and Bootstrap 4.1.1 are both old; removing them (§3.2.1) is the fix.

### 6.2 Application hardening checklist

| Control | Status | Action |
|---|---|---|
| **Rate limiting / anti-spam** on `POST /submit-form` | ❌ Missing | Add `express-rate-limit` (e.g. 5 req/min/IP) + honeypot field; consider CAPTCHA. **Highest-priority security fix.** |
| **CORS allowlist** | ❌ Open to all | `cors({ origin: ['https://amritavidhate.com'], methods: ['POST'] })` |
| **Input validation & size limits** | ❌ None | Validate types/lengths/email; `express.json({ limit: '10kb' })` |
| **Security headers** | ❌ None | Add `helmet()`; set a Content-Security-Policy (esp. since CDNs are used) |
| **SQL injection** | ✅ Parameterised | Keep parameterised queries; never interpolate |
| **Secrets in VCS** | ✅ `.env` ignored | Keep; ensure prod secrets are injected via environment, not files in webroot |
| **HTTPS** | ⚠️ Assumed at Apache | Enforce HTTPS + HSTS at the proxy; make frontend API calls relative so they inherit TLS |
| **SRI on CDN assets** | ⚠️ Partial | Add `integrity`+`crossorigin` to all remaining CDN `<script>`/`<link>`, or self-host |
| **Error disclosure** | ✅ Generic client messages | Keep; ensure stack traces never reach clients in prod |
| **DB account least-privilege** | ❓ Unknown | Use a DB user limited to `INSERT/SELECT` on `contact_form` only |
| **Webroot exposure** | ⚠️ Lives in `/var/www/html` | Ensure `.git/`, `backend/`, `.env`, and `node_modules/` are **not** served by Apache |

### 6.3 Hardened `server.js` (illustrative target)

```js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const apiRoutes = require("./src/routes");

const PORT = process.env.APP_SERVER_PORT || 8000;
const ORIGIN = process.env.CORS_ORIGIN || "https://amritavidhate.com";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: ORIGIN, methods: ["POST"] }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/", rateLimit({ windowMs: 60_000, max: 10 }), apiRoutes);

// Centralised error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

> ⚠️ **Important — webroot exposure:** because the project sits under `/var/www/html`, verify Apache does **not** serve `backend/`, `.env`, `.git/`, or `node_modules/`. A leaked `.env` or `.git` here would be a critical exposure. Move the backend outside the webroot or add explicit `Require all denied` / deny rules.

---

## 7. Prioritised Action Plan (Roadmap)

> **Revised 2026-06-18 (frontend-only).** Phase 1 (backend security) and the backend parts of Phases 0/2 are **resolved by removal**. The roadmap below is frontend-only. `[ ]` = pending, `[x]` = done.

### Phase A — Correctness, dead code & a11y (frontend)
- [ ] Fix `</hé>` → `</p>`; remove the duplicate `.card-container` CSS rule.
- [ ] Remove Bootstrap 4.1.1, jQuery 3.2.1, and the Font Awesome kit from `index.html`.
- [ ] Delete the empty `frontend/src/shared/constants.js`.
- [ ] Fix copy-pasted `alt` text; move inline `style="width:18rem"` to a class; add `aria-label`s to the carousel buttons.

### Phase B — Performance & JS robustness (frontend)
- [ ] `defer` the Bootstrap JS and `script.js`; add `loading="lazy"` + `decoding="async"` to images.
- [ ] Fix `delete resizeTimeout` and the `ms` use-before-declaration; cache the canvas 2D context; pause the starfield when the tab is hidden.
- [ ] Add a `prefers-reduced-motion` guard for the animations.

### Phase C — Deferred (need tooling or decisions)
- Convert images to WebP/AVIF + `srcset` (needs an image pipeline).
- Minify CSS/JS (needs a build step) — or converge with `master`'s Tailwind pipeline.
- Add SRI hashes to the remaining CDN `<link>`s (needs the published hashes — a wrong hash breaks the page).
- Optional: ESLint / Prettier / `.editorconfig`; self-host fonts; Apache gzip/brotli + caching + deny access to `.git/` (server-side, outside this repo).

---

## 8. Appendix

### 8.1 Verification commands used
```bash
git rev-parse --show-toplevel          # confirm repo root
git ls-files                           # confirm no .env tracked
cd backend && npm audit                # 5 vulns (2 moderate, 3 high)
grep -rn axios src server.js config    # axios NOT imported (unused)
grep -rEn "babel|^import|^export" …    # no ESM/babel usage (deps unused)
grep -rn "static|sendFile" server.js   # backend does not serve frontend
node -v                                # v22.22.0
```

### 8.2 Confirmed-good (no action needed)
- Parameterised SQL in `submit-form.routes.js` (no injection on insert).
- `.env` is git-ignored and not present in history; only `.env.example` is.
- Connection pooling is already in use (just untuned).
- Generic error messages returned to clients (no stack-trace leakage to the browser).

### 8.3 Out of scope / assumptions
- Apache configuration is not in this repo; webroot/TLS recommendations are based on the `/var/www/html` deployment path and should be verified against the live server config.
- The `contact_form` table schema was inferred from the `INSERT` (`name, email, company, phone, message`); the authoritative DDL is not in the repo.
- This review covers branch `original-site` only; `master` appears further along and may already implement several items.
