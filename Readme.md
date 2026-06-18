# Portfolio Website

A personal portfolio — a single **static** page showcasing education, experience, skills, and selected work, with a contact email.

## Stack

- **HTML, CSS, and vanilla JavaScript** — no build step, no framework, no backend.
- Bootstrap 5 (via CDN) for layout and icons; a small custom starfield canvas, image carousel, and scroll animations live in `script.js`.

## Project structure

```
frontend/public/
├── index.html      # the page
├── style.css       # styles
├── script.js       # starfield, carousel, scroll animations, contact-email tooltip
└── assets/images/  # images
```

## Running locally

It's a static site — open `frontend/public/index.html` directly in a browser, or serve the folder with any static server:

```bash
# Python
python3 -m http.server --directory frontend/public 8080
# or Node
npx serve frontend/public
```

Then visit http://localhost:8080.

## Deployment

Serve the contents of `frontend/public/` from any static host or web server (e.g. Apache from `/var/www/html`). No server-side runtime is required.

---

> **History:** earlier versions bundled an Express/MySQL backend for a contact form. The form was replaced by a static email and the backend was removed (2026-06-18). See [`docs/plans/`](./docs/plans/) for the change plans and the code review.
