# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

A personal portfolio website with a contact form. Static multi-page frontend (HTML + Tailwind CSS + vanilla JS) and a small Express/MySQL backend that persists contact-form submissions.

## Layout

```
frontend/
  public/          # Static site: *.html pages, style.css, script.js, assets/
  src/input.css    # Tailwind entry (source)
  dist/output.css  # Tailwind build output (git-ignored)
  tailwind.config.js
backend/
  server.js        # Express app entrypoint
  config/db.js     # MySQL connection pool
  src/routes/      # index.js aggregates routes; submit-form.routes.js handles POST /submit-form
.github/workflows/ci.yml
```

## Tech stack

- **Frontend**: HTML, vanilla JS, Tailwind CSS v4 (`@tailwindcss/cli`)
- **Backend**: Node.js, Express 4, body-parser, cors, dotenv
- **Database**: MySQL (via `mysql` / `mysql2`)

## Commands

Frontend (run from `frontend/`):
- `npm install`
- `npm run build:css` — compile Tailwind once (`src/input.css` → `dist/output.css`)
- `npm run watch:css` — rebuild on change

Backend (run from `backend/`):
- `npm install`
- `node server.js` — start the server (no npm script defined yet)

The static site can be served with any static file server pointing at `frontend/public/`.

## Environment

Backend reads from a `.env` file (git-ignored) in `backend/`:
- `APP_SERVER_PORT` — backend port (frontend expects `8000`, see `frontend/public/script.js`)
- `MYSQL_HOST_IP`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

Database expects a `contact_form` table with columns: `name`, `email`, `company`, `phone`, `message`.

## Conventions

- CommonJS modules (`require`/`module.exports`) throughout the backend.
- Routes live under `backend/src/routes/`; register new ones in `index.js`.
- SQL uses parameterized queries (`?` placeholders) — keep it that way.
- Frontend uses no framework or bundler; edit files in `frontend/public/` directly. Do not hand-edit `dist/output.css` — regenerate via Tailwind.
- The contact form's backend URL is hard-coded in `script.js`; update there if the port/host changes.

## CI

`.github/workflows/ci.yml` installs deps and builds CSS for `frontend/` on PRs and pushes to `master`. Test and deploy steps are placeholders.

## Notes for agents

- There are currently no automated tests and no linter configured.
- `package-lock.json` is git-ignored (see `.gitignore`); CI uses `npm ci` for frontend, so be mindful if changing lockfile handling.
- Do not commit secrets or `.env` files.
