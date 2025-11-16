# Sydney Movies App – Product Requirements Document (PRD)
## 1. Strategy

### 1.1 Project Summary

Sydney Movies App is a personalized movie diary designed for film enthusiasts who want a faster and smarter way to select and organize the films on their watchlists. Unlike traditional note-taking tools or apps like Letterboxd, Sydney enables users to filter saved movies by multiple criteria such as genre, age rating, language, runtime, and viewing location. The app learns from user activity to deliver personalized recommendations over time, reducing repetitive searches and helping users choose a film that fits their preferences or family needs. Sydney’s goal is to simplify decision-making and transform movie selection into a quick, engaging, and tailored experience.

### 1.2 User Constituencies

#### Casual Viewer

- **Demographics / Profile**  
  Students or working adults (18 to 35) using mobile devices to find movies for relaxation.
- **Goals and Motivations**  
  Save time finding movies that fit their mood and schedule.
- **Needs / Pain Points**  
  Needs simple filters and personal recommendations based on past choices.

#### Family User

- **Demographics / Profile**  
  Parents (30 to 50) who watch films with children.
- **Goals and Motivations**  
  Ensure selected movies are appropriate for all ages.
- **Needs / Pain Points**  
  Needs age ratings and content filters.

#### Movie Enthusiast

- **Demographics / Profile**  
  Cinephiles of any age who keep detailed records of what they watch.
- **Goals and Motivations**  
  Track and organize watchlists and movie notes.
- **Needs / Pain Points**  
  Needs custom tags and advanced search options.

### 1.3 Usage Contexts

- **Platforms:**  
  Mobile (Android and iOS via mobile web/PWA) and desktop web browser.
- **Environments:**  
  Home entertainment rooms, dorm rooms, and travel settings.
- **Assumptions:**  
  - Requires stable Internet connection for API-based recommendations.  
  - Offers limited offline mode for viewing saved lists.
- **Operating Conditions:**  
  - Users typically spend 5 to 15 minutes browsing before watching.  
  - Shared devices are common (especially for families).

---

## 2. Scope

### 2.1 Feature Chart

| Feature Category            | Key Functions                            | Priority | Included in MVP |
|----------------------------|------------------------------------------|----------|-----------------|
| User Profiles              | Account creation, save preferences       | High     | Yes             |
| Smart Filtering            | Filter by genre, rating, language        | High     | Yes             |
| Personalized Recommendations | AI suggestions, weekly updates        | High     | Yes             |
| Watchlist Management       | Add/remove movies, notes                 | High     | Yes             |
| Search & Sort              | Keyword search, sort by rating/date      | Medium   | Yes             |
| Offline Mode               | View saved list offline                  | Medium   | Yes             |
| Parental Filters           | Restrict content by rating               | Medium   | Yes             |
| API Integration            | Connect to IMDb/TMDB                     | Medium   | Yes             |

> Implementation notes (for later technical specs, not user-facing):
> - User Profiles → Supabase Auth + user preferences table.
> - Smart Filtering → API endpoints and UI for multi-criteria filters.
> - Personalized Recommendations → rules-based/ML-lite engine using watch history and preferences.
> - Watchlist Management → CRUD for personal movie entries and notes.
> - Offline Mode → PWA caching of saved list and basic metadata.
> - API Integration → TMDB/IMDb metadata (subject to rate limits and TOS).

### 2.2 Selected User Stories

1. **Filtering by genre**  
   As a **Casual Viewer**, I want to filter movies by genre so that I can quickly find films that fit my mood.

2. **Age filters for families**  
   As a **Family User**, I want to set age filters so that my children can only see appropriate movies.

3. **Notes on movies**  
   As a **Movie Enthusiast**, I want to add notes to each movie in my watchlist so that I can remember what I liked about it.

4. **Suggestions based on history**  
   As a **User**, I want the app to suggest movies based on what I previously watched so that I can discover new titles.

5. **Keyword search**  
   As a **User**, I want to search for movies by keyword so that I can find a specific title fast.

6. **Offline access**  
   As a **User**, I want to view my watchlist offline so that I can access it even when I don’t have Internet.

7. **Saved preferences**  
   As a **User**, I want to log in and save my preferences so that the app remembers my favorite genres.

8. **Runtime visibility**  
   As a **Parent**, I want to see movie runtime details so that I can choose films that fit our available time.

9. **Sort by rating**  
   As a **User**, I want to sort movies by rating so that I can see the most popular films first.

10. **View trailers**  
    As a **Viewer**, I want to see trailers within the app so that I can preview before watching.

11. **Weekly recommendations**  
    As a **Frequent User**, I want to receive weekly recommendations so that I stay updated on new releases.

---

## 3. Exclusions

- No social media posting or public sharing.
- No movie streaming or downloading services.
- No professional critic reviews beyond viewer ratings.
- No advanced parental controls (beyond rating/content filters).
- Limited API integration with mainstream platforms only (e.g., selected IMDb/TMDB endpoints).
