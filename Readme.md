# Portfolio Website

## Project Description

This project is a simple portfolio website showcasing personal education, experience, and a contact form. The website is built with a tech stack that includes HTML, CSS, JavaScript, Node.js, Express, and MySQL. Companies and individuals can use the contact form to reach out for potential opportunities and inquiries.

## Project Stack

- **Frontend**: HTML, CSS (Tailwind CSS v4), JavaScript
- **Backend**: Node.js, Express
- **Database**: MySQL

## Features

- **Personal Information**: Display of education and experience details.
- **Contact Form**: A form for visitors to send messages directly to the website owner.
- **Responsive Design**: Ensuring the website is accessible and usable on various devices.

## Project Structure

```
frontend/   # Static site (HTML pages, Tailwind CSS, vanilla JS, assets)
backend/    # Express server + MySQL contact-form API
docs/       # Project documentation and plans
```

## Installation and Setup

### Prerequisites

- Node.js and npm (Node Package Manager)
- MySQL
- `make` and `python3` (optional, for the Makefile helpers)

### Quick start (Makefile)

From the repo root:

```bash
make install     # install frontend + backend deps
make db-setup    # load the DB schema (needs backend/.env)
make start       # build CSS and start both servers in the background
make stop        # stop them again
make help        # list all available commands
```

### Frontend

```bash
cd frontend
npm install
npm run build:css      # build Tailwind once (src/input.css -> dist/output.css)
# or: npm run watch:css to rebuild on change
```

Serve the contents of `frontend/public/` with any static file server.

### Backend

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```
APP_SERVER_PORT=8000
CORS_ORIGIN=                 # comma-separated allowed origins (blank = allow all, dev only)
MYSQL_HOST_IP=<host>
MYSQL_USER=<user>
MYSQL_PASSWORD=<password>
MYSQL_DATABASE=<database>
```

Create the database table from the provided schema:

```bash
mysql -u <user> -p <database> < backend/db/schema.sql
```

Then install and run:

```bash
cd backend
npm install
npm start          # or: npm run dev (auto-reload)
npm test           # run the smoke tests
```

The contact form posts to the backend URL configured in `frontend/public/config.js`
(`window.APP_CONFIG.backendUrl`, default `http://localhost:8000`).

## Development Notes

- See [AGENTS.md](AGENTS.md) for detailed guidance on structure, commands, and conventions.
- See [docs/plans/improvements.md](docs/plans/improvements.md) for the roadmap of possible improvements.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pull requests and pushes to `master`:
a **frontend** job that builds the CSS, and a **backend** job that lints and tests. The
deploy step is gated to `master` and is currently a placeholder.
