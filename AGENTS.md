# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

A personal portfolio website with a contact form. Static multi-page frontend (HTML + Tailwind CSS + vanilla JS) and a small Express/MySQL backend that persists contact-form submissions.

## Layout

```
Makefile           # Colorful task runner (make help)
frontend/
  public/          # Static site root (deployable): *.html, style.css, script.js, config.js, assets/
    dist/output.css  # Tailwind build output (git-ignored)
  src/input.css    # Tailwind entry (source)
  tailwind.config.js
backend/
  server.js        # Loads env + starts the listener
  src/app.js       # Express app (CORS, body-parser, routes) — exported for tests
  config/db.js     # MySQL2 promise connection pool
  src/routes/      # index.js aggregates routes; submit-form.routes.js handles POST /submit-form
  src/middleware/  # validate-contact.js — contact-form validation
  db/schema.sql    # contact_form table definition
  __tests__/       # Jest + supertest smoke tests
  eslint.config.js # ESLint v9 flat config
  .env.example
.github/workflows/ci.yml
.prettierrc.json
```

## Tech stack

- **Frontend**: HTML, vanilla JS, Tailwind CSS v4 (`@tailwindcss/cli`)
- **Backend**: Node.js, Express 4, body-parser, cors, dotenv
- **Database**: MySQL (via `mysql` / `mysql2`)

## Commands

Easiest path — from the repo root via the Makefile (`make help` lists all):
- `make install` — install frontend + backend deps
- `make build` — build Tailwind CSS
- `make start` / `make stop` / `make restart` — run both servers in the background
- `make lint` / `make test` / `make format` — backend quality checks
- `make db-setup` — load `backend/db/schema.sql` using `backend/.env`

Frontend (run from `frontend/`):
- `npm install`
- `npm run build:css` — compile Tailwind once (`src/input.css` → `public/dist/output.css`)
- `npm run watch:css` — rebuild on change

`frontend/public/` is the deployable web root (HTML references `./dist/output.css`); serve that directory directly.

Backend (run from `backend/`):
- `npm install`
- `npm start` — start the server · `npm run dev` — start with nodemon
- `npm test` — Jest + supertest · `npm run lint` — ESLint · `npm run format` — Prettier

The static site can be served with any static file server pointing at `frontend/public/`.

## Environment

Backend reads from a `.env` file (git-ignored) in `backend/` — see `backend/.env.example`:
- `APP_SERVER_PORT` — backend port (defaults to `8000`; frontend expects `8000`)
- `CORS_ORIGIN` — comma-separated allowed origins (unset = allow all, dev only)
- `MYSQL_HOST_IP`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

Database expects a `contact_form` table (`backend/db/schema.sql`). The frontend backend URL is set in `frontend/public/config.js` (`window.APP_CONFIG.backendUrl`).

## Conventions

- CommonJS modules (`require`/`module.exports`) throughout the backend.
- Routes live under `backend/src/routes/`; register new ones in `index.js`. Add request validation as middleware (see `src/middleware/`).
- SQL uses parameterized queries (`?` placeholders) via the mysql2 promise pool — keep it that way.
- Frontend uses no framework or bundler; edit files in `frontend/public/` directly. Do not hand-edit `dist/output.css` — regenerate via Tailwind.
- Backend code is linted with ESLint and formatted with Prettier (`printWidth: 100`, double quotes, semicolons).

## CI

`.github/workflows/ci.yml` runs two jobs on PRs and pushes to `master`: **frontend** (build CSS) and **backend** (lint + test). A deploy job is gated to `master` and is still a placeholder.

## Notes for agents

- Backend has Jest + supertest tests (`npm test`) and ESLint (`npm run lint`) — run both before committing backend changes.
- Lockfiles are committed; CI uses `npm ci`. Run `npm install` after changing deps so the lockfile updates.
- Do not commit secrets or `.env` files.
