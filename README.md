# Sydney Movies App

Sydney Movies App is a mobile-first web application for film enthusiasts to organize and filter their personal movie diary and watchlists.

## Tech stack

- React client (PWA) in `/client` using Vite for local development
- Express API in `/api` (Node.js)
- Supabase SQL migrations and seeds in `/supabase`
- Documentation (PRD, site map, OpenAPI spec, deployment notes) in `/docs`

## Repository layout

- `/client` – React PWA frontend
- `/api` – Express REST API
- `/supabase` – database migrations and seed scripts for Supabase
- `/docs` – product and technical documentation

## Getting started

Scaffolding for the client, API, and Supabase migrations will be added next. Clone this repository and follow upcoming setup instructions in this README as the project evolves.

## Deployed application

https://main.d12p5zr8qcw2kd.amplifyapp.com

## Setup on a new computer

### Prerequisites

- **Node.js**
  - Recommended: Node 20+
- **Git**

### Clone the repo

```bash
git clone https://github.com/xbf66669-lab/Sydney_Movies_App.git
cd Sydney_Movies_App
```

### Install dependencies

```bash
# Client
cd client
npm install

# API
cd ..\api
npm install
```

### Environment variables

This project uses environment variables for third-party services. **Do not commit `.env` files.**

#### Client (`/client`)

Create `client/.env.local` and set values:

- `VITE_SUPABASE_URL=`
- `VITE_SUPABASE_ANON_KEY=`
- `VITE_TMDB_API_KEY=`
- `VITE_API_BASE=` (optional; defaults to `/api`)

#### API (`/api`)

Local/offline development uses `dotenv` when `IS_OFFLINE` is set.

Create `api/.env` and set values:

- `SUPABASE_URL=`
- `SUPABASE_KEY=`
- `JWT_SECRET=`
- `PORT=` (optional)
- `IS_OFFLINE=true`

In production, the API loads secrets from **AWS Secrets Manager** (configured via `SECRETS_ID`).

### Run locally

#### Run the client

```bash
cd client
npm run dev
```

#### Run the API (optional)

```bash
cd api
npm run dev
```

## Known issues / incomplete features

- **Recent comments are not persisting across devices yet**
  - If you see "cloud sync unavailable", it usually means the Supabase `notes` table is missing or not exposed.
- **Mobile images are a bit large on phone screens**
  - The app is still usable/navigable.

## Support

If any issues persist and you need help, contact me through Slack.