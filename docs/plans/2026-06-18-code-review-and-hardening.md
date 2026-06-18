# Portfolio Website — Code Review, Improvement & Hardening Plan

> **Date:** 2026-06-18
> **Branch reviewed:** `original-site`
> **Reviewer:** Engineering review (automated analysis)
> **Scope:** Full application — `frontend/` (static HTML/CSS/JS) and `backend/` (Node.js/Express/MySQL)

---

## 1. Executive Summary

This is a small personal-portfolio website: a **static frontend** (plain HTML/CSS/vanilla JS) served by a web server (Apache, from `/var/www/html`), plus a **minimal Express backend** exposing a single `POST /submit-form` endpoint that writes contact-form submissions into a MySQL table.

The code is small, readable, and the one piece of database code already uses **parameterised queries** (good — no SQL injection on the insert). However, the project is at a "works on my machine" stage and is **not production-ready**. The most important issues are:

| # | Issue | Severity | Area |
|---|-------|----------|------|
| 1 | Contact form has **no rate limiting / anti-spam** — open to flooding & DB/cost abuse | 🔴 High | Security |
| 2 | Frontend calls a **hardcoded `http://localhost:8000`** — broken in production + mixed-content | 🔴 High | Correctness |
| 3 | **CORS is fully open** (`cors()` with no options) | 🟠 Medium-High | Security |
| 4 | **No input validation / size limits** on the form payload | 🟠 Medium-High | Security |
| 5 | **5 npm vulnerabilities (3 high)** from **unused** deps (`@babel/*`, `axios`) | 🟠 Medium | Supply chain |
| 6 | **No security headers** (no `helmet`) | 🟠 Medium | Security |
| 7 | Duplicate/conflicting **Bootstrap 4 + Bootstrap 5** and unused, outdated **jQuery 3.2.1** loaded from CDNs | 🟠 Medium | Perf / Security |
| 8 | Unoptimised images, render-blocking assets, always-on canvas animation | 🟡 Medium | Performance |
| 9 | Malformed HTML (`</hé>`), wrong `alt` text, dead `constants.js`, no `npm` scripts | 🟡 Low | Quality |

None of the findings are catastrophic for a low-traffic personal site, but items 1–4 should be fixed before the endpoint is exposed publicly, and item 2 means the form **does not currently work off `localhost`**.

> **Note on branches:** `git log --all` shows a more advanced line of work on other branches (`master`) — Tailwind build pipeline, email obfuscation, SEO meta, lazy loading, asset pruning. Several items below may already be addressed there. This review is scoped to **`original-site`** as requested; where relevant, "converge with `master`" is called out.

---

## 2. Architecture Overview

```
portfolio/
├── frontend/                         # Static site (served by Apache, NOT by Express)
│   ├── public/
│   │   ├── index.html                # Single-page portfolio (502 lines)
│   │   ├── style.css                 # Hand-written CSS (720 lines)
│   │   ├── script.js                 # Vanilla JS: starfield, carousel, animations, form (283 lines)
│   │   └── assets/images/            # ~40 PNG/JPG screenshots + SVGs (unoptimised)
│   └── src/shared/constants.js       # EMPTY — dead file
└── backend/                          # Express API
    ├── server.js                     # App bootstrap (28 lines)
    ├── config/db.js                  # MySQL connection pool (uses legacy `mysql` driver)
    ├── src/routes/
    │   ├── index.js                  # Route aggregator
    │   └── submit-form.routes.js     # POST /submit-form → INSERT into contact_form
    ├── package.json                  # No name/version/scripts; mixes runtime + build deps
    └── package-lock.json
```

**Request flow:** Browser → `fetch('http://localhost:8000/submit-form')` → Express → `mysql` pool → `INSERT INTO contact_form`.

**Key architectural observations:**
- The backend **does not serve the frontend** (no `express.static`); the two are deployed independently.
- The frontend has **no build step** on this branch (raw files in `public/`).
- The only dynamic feature is the contact form. Everything else is static content.

---

## 3. Code Review — Findings by Area

### 3.1 Backend

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
- 🟡 **Inputs:** phone uses `type="text"` (should be `type="tel"`); no `maxlength`; no `name` attributes (fine since JS reads by `id`, but `name` aids autofill).

#### 3.2.2 `script.js`
- 🔴 **Hardcoded API endpoint** — `fetch("http://localhost:8000/submit-form")` ([frontend/public/script.js:260](../../frontend/public/script.js#L260)). This **breaks in production** (wrong host) and triggers **mixed-content blocking** when the page is served over HTTPS (the canonical URL is `https://amritavidhate.com`). Make it a relative path (`/submit-form` behind a reverse proxy) or a build-time config value.
- 🟡 **`delete resizeTimeout`** ([:15](../../frontend/public/script.js#L15)) — `delete` on a `let` binding is a no-op (and invalid in strict mode). Use `clearTimeout(resizeTimeout); resizeTimeout = null;`.
- 🟡 **`ms` used before declaration** — referenced at [:28](../../frontend/public/script.js#L28) but declared at [:87](../../frontend/public/script.js#L87) (`let ms = 16`). Works only because the `requestAnimationFrame` branch short-circuits before the TDZ access; fragile.
- 🟡 **`alert()` for feedback** ([:270,273,278](../../frontend/public/script.js#L270)) — blocking and dated UX; replace with inline status / toast.
- 🟡 **Globals** — `canvas`, `stars` are implicit/explicit globals; wrap in a module/IIFE.
- 🟡 **No client-side validation messaging** beyond native `required`.

#### 3.2.3 `style.css`
- 🟡 **Duplicate rule** — `.card-container { overflow: hidden; width: 100%; }` is declared twice ([frontend/public/style.css:215-223](../../frontend/public/style.css#L215)).
- 🟡 **Contact form `opacity: 0.6`** ([:289](../../frontend/public/style.css#L289)) dims the *entire* form including inputs/labels, reducing text contrast (WCAG concern). Use a semi-transparent `background-color` instead.
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
| Make the form's API URL relative / configurable (fix the localhost bug) | S | High |
| Fix `</hé>` tag, duplicate Bootstrap, dead jQuery/FA, duplicate CSS rule | S | High |
| Add `name`, `version`, and `scripts` (`start`, `dev`) to `package.json` | S | Med |
| Add `.env.example` + startup env validation (fail fast) | S | Med |
| Commit a `schema.sql` (or migration) for `contact_form` | S | Med |
| Delete dead `constants.js` and unused deps (`axios`, `@babel/*`, `mysql`) | S | Med |

### 4.2 Robustness
| Improvement | Effort | Impact |
|---|---|---|
| Migrate `config/db.js` + route to **`mysql2/promise`** with `async/await` and pool limits | M | Med |
| Add request validation (e.g. `express-validator` or `zod`) + payload size cap | M | High |
| Global error-handling middleware + `/health` endpoint + graceful shutdown | M | Med |
| Replace `alert()` with inline form status + disabled-button-on-submit | S | Med |

### 4.3 Tooling & Process
| Improvement | Effort | Impact |
|---|---|---|
| Add ESLint + Prettier + `.editorconfig` | S | Med |
| Add a GitHub Actions CI (lint, `npm audit`, build) | M | Med |
| Add a Dockerfile / docker-compose (app + MySQL) for reproducible deploys | M | Med |
| Add a smoke/integration test for `POST /submit-form` (e.g. supertest) | M | Med |
| Expand README (env, DB setup, run, deploy) | S | Med |

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

### 5.4 Backend
11. Set explicit **pool `connectionLimit`** and reuse a single promise pool (already pooled — just tune it).
12. Add **`compression`** middleware only if the backend ever serves payloads (currently returns tiny JSON — low priority).

---

## 6. Security Vulnerability Scan & Hardening

### 6.1 Dependency scan (`npm audit`, backend)

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

### Phase 0 — Quick wins (≈ half a day, low risk)
1. Remove unused deps → clears **all 5 npm vulnerabilities**: `npm uninstall @babel/core @babel/node @babel/preset-env axios mysql`.
2. Fix the broken API URL in `script.js` (relative path / config) — **restores form functionality in prod**.
3. Delete Bootstrap 4.1.1, jQuery 3.2.1, Font Awesome kit from `index.html`.
4. Fix `</hé>` typo, duplicate `.card-container` CSS, delete empty `constants.js`.
5. Add `name`/`version`/`scripts` to `package.json`; add `PORT` fallback.

### Phase 1 — Security hardening (≈ 1 day)
6. Add `helmet`, CORS allowlist, `express-rate-limit`, body-size limit.
7. Add input validation (`express-validator`/`zod`) + honeypot.
8. Add `.env.example`, startup env validation, and a `schema.sql` for `contact_form`.
9. Verify/lock down Apache so `backend/`, `.env`, `.git/` aren't web-served; least-privilege DB user.

### Phase 2 — Quality & robustness (≈ 1–2 days)
10. Migrate to `mysql2/promise` + `async/await`; tune pool.
11. Global error handler, `/health`, graceful shutdown.
12. ESLint + Prettier + `.editorconfig`; fix `alert()` UX, `delete resizeTimeout`, alt text, a11y on carousel.
13. Smoke test for `POST /submit-form`; basic GitHub Actions CI (lint + `npm audit`).

### Phase 3 — Performance & polish (≈ 1–2 days)
14. Optimise/convert images to WebP/AVIF + `srcset` + `loading="lazy"`.
15. `defer` scripts; minify local CSS/JS; enable gzip/brotli + caching in Apache.
16. Pause starfield off-screen/hidden; cache 2D context; honour `prefers-reduced-motion`.
17. Expand README; optionally Dockerise; consider converging with `master`'s build pipeline.

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
