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

### Frontend

```bash
cd frontend
npm install
npm run build:css      # build Tailwind once (src/input.css -> dist/output.css)
# or: npm run watch:css to rebuild on change
```

Serve the contents of `frontend/public/` with any static file server.

### Backend

Create a `.env` file in `backend/` with:

```
APP_SERVER_PORT=8000
MYSQL_HOST_IP=<host>
MYSQL_USER=<user>
MYSQL_PASSWORD=<password>
MYSQL_DATABASE=<database>
```

The database should contain a `contact_form` table with columns: `name`, `email`, `company`, `phone`, `message`.

```bash
cd backend
npm install
node server.js
```

The contact form posts to `http://localhost:8000/submit-form` (configured in `frontend/public/script.js`).

## Development Notes

- See [AGENTS.md](AGENTS.md) for detailed guidance on structure, commands, and conventions.
- See [docs/plans/improvements.md](docs/plans/improvements.md) for the roadmap of possible improvements.

## CI

GitHub Actions (`.github/workflows/ci.yml`) installs dependencies and builds the frontend CSS on pull requests and pushes to `master`. Test and deploy steps are currently placeholders.
