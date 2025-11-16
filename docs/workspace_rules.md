# Sydney Movies App – Workspace Rules

## 1. General Principles

- **Clarity over cleverness**  
  Prefer readable, well-structured code over “smart” one-liners.
- **Small, focused changes**  
  Keep PRs small and scoped to a single concern when possible.
- **Documentation lives in `/docs`**  
  Update PRD, task list, and workspace rules when behavior or scope changes.

---

## 2. Repository Structure

- `/client` – React (Vite) PWA frontend
- `/api` – Express/Node backend
- `/supabase` – SQL migrations, seed scripts, DB docs
- `/docs` – PRD, task_list, workspace_rules, architecture notes, OpenAPI, etc.
- [README.md](cci:7://file:///C:/Users/Ethan/CascadeProjects/Sydney_Movies_App/README.md:0:0-0:0) – Developer onboarding and high-level overview

**Rule:** Do not add new top-level directories without updating [README.md](cci:7://file:///C:/Users/Ethan/CascadeProjects/Sydney_Movies_App/README.md:0:0-0:0) and (if relevant) the PRD.

---

## 3. Git & Branching

- **Default branch:** `main`
- **Feature branches:**  
  - Format: `feature/<short-description>`  
    Example: `feature/watchlist-crud`, `feature/filters-runtime`
- **Bugfix branches:**  
  - Format: `fix/<short-description>`
- **Commit messages:**
  - Use present tense, concise:  
    - `Add watchlist CRUD endpoints`
    - `Implement genre filter UI`

**Rule:** All changes must go through a PR (no direct pushes to `main`).

---

## 4. Code Style

### 4.1 Frontend (`/client` – React/Vite)

- **Language:** TypeScript (prefer `.tsx`/`.ts`).
- **Components:**
  - Functional components with hooks.
  - Keep components focused; extract reusable UI where it clarifies intent.
- **State management:**
  - Start with React Query + local component state.
  - Introduce global state only when a use case clearly requires it.
- **Styling:**
  - Use a single chosen approach (e.g., CSS modules or Tailwind) consistently.
  - Keep layout mobile-first; test at small breakpoints.

**Rule:** No inline business logic in JSX when it reduces readability—extract helpers or hooks.

### 4.2 Backend (`/api` – Express)

- **Language:** TypeScript preferred; if JS, use ES modules.
- **Structure:**
  - Separate routes, controllers/handlers, and service/data-access layers.
  - Keep request/response validation at the edge (e.g., middleware).
- **Error handling:**
  - Centralized error middleware.
  - Use consistent error shapes for API responses.

**Rule:** Never access the database directly from route handlers; go through a service or repository layer.

---

## 5. Environment & Secrets

- **`.env` files are never committed.**
- Use `.env.example` to document required environment variables:
  - Supabase URL and key
  - TMDB/IMDb API keys (if applicable)
  - Any other secrets
- **Local config precedence:**
  - `.env.local` (gitignored) overrides `.env` when needed.

**Rule:** If a new env variable is introduced, update `.env.example` and [README.md](cci:7://file:///C:/Users/Ethan/CascadeProjects/Sydney_Movies_App/README.md:0:0-0:0).

---

## 6. Database & Supabase

- All schema changes go through migrations in `/supabase`.
- **Migration naming:**
  - `YYYYMMDDHHMM_<short-description>.sql`
- **Seeds:**
  - Keep small, deterministic seed data for dev/demo environments.
- Changes must be backwards compatible where possible, or clearly noted in the PR.

**Rule:** Never edit the database manually in production without an associated migration file in the repo.

---

## 7. Testing & Quality

- Aim for tests on:
  - Critical backend logic (recommendations, filtering).
  - Key frontend flows (watchlist CRUD, filters).
- **Types:**
  - Unit tests for pure logic.
  - Integration tests for API endpoints and essential UI flows.
- Linting/formatting:
  - Use a shared formatter (Prettier) and linter (ESLint) in both `/client` and `/api`.

**Rule:** New features should include or extend tests, especially when touching recommendations, filtering, or auth.

---

## 8. PR Expectations

Each PR should include:

- **Scope summary:** What was changed and why (1–3 bullets).
- **Testing notes:** How it was tested locally (commands, manual flows).
- **Impact:** Any migrations, env variables, or breaking changes.

**Rule:** PRs that change behavior described in [docs/prd.md](cci:7://file:///c:/Users/Ethan/CascadeProjects/Sydney_Movies_App/docs/prd.md:0:0-0:0) must mention and, if necessary, update the PRD and [docs/task_list.md](cci:7://file:///c:/Users/Ethan/CascadeProjects/Sydney_Movies_App/docs/task_list.md:0:0-0:0).

---

## 9. Collaboration & Tasks

- Use [docs/task_list.md](cci:7://file:///c:/Users/Ethan/CascadeProjects/Sydney_Movies_App/docs/task_list.md:0:0-0:0) to:
  - Track epics and tasks.
  - Mark completion and add notes/links to PRs.
- When starting work:
  - Reference the relevant task ID (e.g., `A2`, `B3`) in branch names and PR titles.

**Rule:** Do not silently change acceptance criteria—update [task_list.md](cci:7://file:///c:/Users/Ethan/CascadeProjects/Sydney_Movies_App/docs/task_list.md:0:0-0:0) and mention it in the PR.

---

## 10. Performance & UX Focus

- Optimize for **fast time to movie choice**, not just raw performance metrics.
- Keep the UI snappy:
  - Avoid blocking calls in the main thread where possible.
  - Provide loading states and empty states for all major lists and panels.

**Rule:** Any change that significantly impacts perceived performance should be explained in the PR description with rationale.