# Improvement Plan

A prioritized list of possible improvements for the portfolio project. Items are grouped by area and roughly ordered by impact-vs-effort within each group.

## 1. Configuration & robustness

- **Add npm scripts to `backend/package.json`** — at minimum `start` (`node server.js`) and `dev` (e.g. `nodemon server.js`). Currently the backend must be started manually.
- **Validate/default the server port** — `APP_SERVER_PORT` is required with no fallback; default to `8000` if unset so the app matches the frontend's hard-coded URL.
- **Provide a `.env.example`** — document `APP_SERVER_PORT`, `MYSQL_HOST_IP`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` without committing real secrets.
- **Add a DB schema/migration file** — ship the `contact_form` table definition (and a seed/setup script) so the backend is reproducible.
- **Make the contact-form endpoint configurable on the frontend** — the URL `http://localhost:8000/submit-form` is hard-coded in `script.js`; move it to a small config or build-time variable so production deploys don't point at localhost.

## 2. Security & correctness

- **Server-side validation** — validate and sanitize `name`, `email`, `company`, `phone`, `message` before insertion; reject empty/oversized payloads.
- **Tighten CORS** — `cors()` currently allows all origins; restrict to the deployed frontend origin.
- **Add rate limiting** on `POST /submit-form` (e.g. `express-rate-limit`) to deter spam/abuse.
- **Add basic spam protection** for the contact form (honeypot field or CAPTCHA).
- **Drop the redundant `mysql` dependency** — both `mysql` and `mysql2` are listed; standardize on `mysql2` (supports promises) and remove the other.

## 3. Tooling & quality

- **Add a linter/formatter** — ESLint + Prettier with a shared config; wire into CI.
- **Add tests** — the CI "Run Tests" step is a placeholder. Add at least a smoke test for the backend route (e.g. supertest) and replace the echo step.
- **Flesh out CI** — run backend install/lint/test in addition to the frontend CSS build; add a real deploy step (or remove the placeholder `cd` job until one exists).
- **Reconsider ignoring `package-lock.json`** — committing lockfiles makes `npm ci` reproducible; currently it is git-ignored.

## 4. Frontend improvements

- **Consolidate repeated DOM-ready handlers** in `script.js` into a single initializer for clarity.
- **Accessibility pass** — alt text on images, focus states, ARIA labels on the carousel/nav controls, keyboard navigation.
- **Performance** — optimize/compress images in `assets/` (several large PNG/JPGs), add `loading="lazy"`.
- **Replace `alert()` form feedback** with inline, non-blocking UI messages.
- **SEO/meta** — ensure each page has a title, description, and Open Graph tags; add a favicon reference check.

## 5. Documentation

- Keep [AGENTS.md](../../AGENTS.md) in sync as structure/commands evolve.
- Expand the README setup section with concrete run steps for both frontend and backend (partially addressed).

## Suggested first milestone

1. Backend `start`/`dev` scripts + `.env.example` + DB schema file.
2. Server-side validation + CORS restriction on the contact endpoint.
3. ESLint/Prettier + a backend smoke test wired into CI.
