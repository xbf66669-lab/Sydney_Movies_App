# Sydney Movies App – Task List (from PRD)

## Epic A – Movie Library & Watchlist

- [ ] **A1: User accounts and profiles**
  - Implement user registration/login (Supabase Auth).
  - Store user preferences (favorite genres, default filters).

- [ ] **A2: Watchlist CRUD**
  - Create movie model (title, year, genres, rating, runtime, language, location, notes, watched flag).
  - Backend: CRUD endpoints for user’s watchlist.
  - Frontend: UI to add, edit, delete movies in the watchlist.

- [ ] **A3: Movie notes (US3)**
  - Frontend: notes field per movie.
  - Backend: persist notes in DB.

- [ ] **A4: Mark as watched & basic rating**
  - Frontend: toggle watched, set rating.
  - Backend: store watched status and rating.

---

## Epic B – Smart Filtering & Search

- [ ] **B1: Filter by genre (US1)**
  - Frontend: genre filter UI (multi-select).
  - Backend: query movies by genre for current user.

- [ ] **B2: Age/parental filters (US2)**
  - Frontend: filter by age rating/content.
  - Backend: filter by rating and default “family-safe” presets.

- [ ] **B3: Runtime filter (US8)**
  - Frontend: runtime slider or preset ranges (e.g., < 90 min).
  - Backend: range queries on runtime.

- [ ] **B4: Search & sort (US5, US9)**
  - Frontend: keyword search box, sort controls (rating, date added).
  - Backend: text search on title, sort options in API.

- [ ] **B5: Language and location filters (from PRD summary)**
  - Frontend: filters for language and viewing location (Netflix, Blu-ray, etc.).
  - Backend: filter support on these fields.

---

## Epic C – Recommendations & Personalization

- [ ] **C1: Basic recommendation engine (US4)**
  - Define simple rules (e.g., recommend unwatched movies matching favorite genres, sorted by rating).
  - Backend: `/recommendations` endpoint using user preferences and history.
  - Frontend: “Recommended for you” section.

- [ ] **C2: Weekly recommendations (US11)**
  - Backend: generate weekly recommendation sets (batch job or on-demand “this week” set).
  - Optional: email or in-app “This week’s picks” view.

---

## Epic D – Media Enhancements & Trailers

- [ ] **D1: Trailer support (US10)**
  - Integrate with TMDB/YouTube to fetch trailer URLs.
  - Frontend: show embedded trailer player on movie detail page.

- [ ] **D2: API integration for metadata**
  - Backend: integration with TMDB/IMDb for title, year, poster, runtime, rating, etc.
  - Frontend: search UI that pulls metadata into new watchlist entries.

---

## Epic E – Offline & PWA Experience

- [ ] **E1: PWA setup**
  - Add manifest, icons, and service worker (Vite plugin or custom).
  - Ensure mobile installability.

- [ ] **E2: Offline watchlist view (US6)**
  - Cache user’s watchlist for offline access.
  - Show read-only list when offline; communicate offline state in UI.

---

## Epic F – Foundations & UX

- [ ] **F1: Navigation & screen map**
  - Define main screens: Auth, Watchlist, Filters/Explore, Movie Detail, Settings.
  - Implement routing in React.

- [ ] **F2: Mobile-first layout**
  - Design list and detail views optimized for small screens.
  - Sticky filter bar, large tap targets, minimal typing.

- [ ] **F3: Instrumentation for “time to movie pick”**
  - Track timestamps from “open app” to “start movie” action.
  - Store simple analytics events to measure success.
