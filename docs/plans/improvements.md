# Improvement Plan

A prioritized list of possible improvements for the portfolio project. Items are grouped by area and roughly ordered by impact-vs-effort within each group.

> Status legend: `[x]` done · `[~]` partially done · `[ ]` not started.
> Most backend, security, and tooling items were implemented on 2026-06-15.

## 1. Configuration & robustness

- [x] **Add npm scripts to `backend/package.json`** — `start`, `dev` (nodemon), `test`, `lint`, `format`.
- [x] **Validate/default the server port** — `APP_SERVER_PORT` now defaults to `8000`.
- [x] **Provide a `.env.example`** — added at `backend/.env.example`.
- [x] **Add a DB schema/migration file** — added at `backend/db/schema.sql` (with `make db-setup`).
- [x] **Make the contact-form endpoint configurable on the frontend** — via `frontend/public/config.js` (`window.APP_CONFIG.backendUrl`).

## 2. Security & correctness

- [x] **Server-side validation** — `backend/src/middleware/validate-contact.js` validates/length-checks fields.
- [x] **Tighten CORS** — configurable allow-list via `CORS_ORIGIN` (allow-all only when unset, for dev).
- [x] **Add rate limiting** — `express-rate-limit` on `POST /submit-form` (5 / 15 min / IP).
- [x] **Add basic spam protection** — hidden honeypot `website` field, dropped server-side.
- [x] **Drop the redundant `mysql` dependency** — standardized on `mysql2` (promise pool); also removed unused `axios`/babel deps.

## 3. Tooling & quality

- [x] **Add a linter/formatter** — ESLint v9 flat config + Prettier in the backend.
- [x] **Add tests** — Jest + supertest smoke tests for the contact route (`backend/__tests__`).
- [x] **Flesh out CI** — separate frontend (build) and backend (lint + test) jobs; deploy gated to `master`.
- [x] **Reconsider ignoring `package-lock.json`** — lockfiles are now committed for reproducible `npm ci`.

## 4. Frontend improvements

- [~] **Consolidate repeated DOM-ready handlers** in `script.js` — handlers now guard for missing elements; full consolidation still pending.
- [~] **Accessibility pass** — added `aria-live` status region, labelled honeypot, `tel` input; broader audit (alt text, focus states, carousel ARIA) still pending.
- [ ] **Performance** — optimize/compress images in `assets/`, add `loading="lazy"`.
- [x] **Replace `alert()` form feedback** — inline `#formStatus` messages instead of blocking alerts.
- [ ] **SEO/meta** — per-page titles, descriptions, Open Graph tags.

> Note: wiring the above also fixed a latent bug — `contact.html` previously had no form `id`, no phone field, and never loaded `script.js`, so the contact form did not actually submit.

## 5. Documentation

- [x] Keep [AGENTS.md](../../AGENTS.md) in sync as structure/commands evolve.
- [x] Expand the README with concrete run steps for both frontend and backend (plus the Makefile).

## Remaining next steps

1. Frontend accessibility audit and image optimization (`loading="lazy"`, compression).
2. Per-page SEO/meta tags.
3. A real deploy step in the CI `cd` job.
