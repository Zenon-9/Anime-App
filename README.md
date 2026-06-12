# Aniverse — Premium Anime, Character & Manga Portal

**Aniverse** is a highly responsive, premium React-based web portal designed for discovering, tracking, and comparing anime and manga titles, as well as exploring character databases. Powered by the Jikan API (MAL v4), it combines advanced layout designs, glassmorphism aesthetics, responsive viewports, and custom UI components.

🌐 **Live Demo / Deploy Target**: [https://Zenon-9.github.io/Anime-App/](https://Zenon-9.github.io/Anime-App/)

---

## 🌟 Key Features

### 📅 Airing Calendar
- Dynamic weekly calendar schedule displaying anime airing by day (Monday through Sunday).
- Integrates skeletons and cache results to ensure high performance and smooth transition tabs.

### ⚔️ Compare Matchup Deck
- Side-by-side comparison engine. Load any two titles to compare MAL score ratings, global popularity ranks, member favorites, episode counts, animation studios, release seasons, age ratings, and comparative synopses.
- **Main Cast Matchup**: Displays the top main characters of both titles side-by-side. Characters are clickable, triggering their profile bios.
- Includes a quick-search debounced selector panel for populating Slot A and Slot B inputs.

### 📖 Manga Archives
- Dedicated search page for manga, light novels, novels, one-shots, manhwa, and manhua.
- Renders detailed cards showing authors, volumes, chapters, serialized magazines, publication dates, and genre tags.
- Features paginated results to explore the database page-by-page.

### 🎭 Character Directory
- Search and browse character cards showing high-resolution avatars and MAL favorites count.
- **Detailed Character Bios**: Read formatted character biographies, view voice actor (VA) cast grids with language tags, and see related anime/manga appearances.
- Features paginated search result lists.

### 🔄 Circular Database Navigation
- Connects Anime, Characters, and Manga together in a unified network:
  - In an Anime's details modal, click on a character card to open their character bio.
  - In a Character's bio, go to their Anime or Manga tab and click any title to switch back to that media's detail modal.
  - In a Manga's details modal, click on a character card to view their profile.

### 📝 User Reviews
- Integrates a **Reviews** tab inside both Anime and Manga details modals.
- Displays full user reviews from MyAnimeList, including author usernames, profile avatars, publishing dates, rating scores out of 10, and scroll-contained review text.

### 📊 Library Analytics & Watchlists
- **Multi-user Watchlist Isolation**: Mock authentication syncing user profiles locally to browser `localStorage`. Watchlists are isolated by username keys, allowing multiple registered users to track their lists independently.
- **Library Tracker**: Update watch status (Watching, Plan to Watch, Completed, Dropped), log episode progress (increment/decrement), and assign ratings.
- **Analytics Dashboard**: Automatic calculation of total watch time (converted to days, hours, minutes), average score, genre distribution charts, and total entries tracked.

### 🌓 Aesthetic Theme Selectors
- Seamless Light / Dark theme selector syncing theme attributes to the DOM and saving user preferences across sessions.
- Premium styling: custom scrollbars, animated fade-ins, border rings, and dark glassmorphic cards.

---

## 🛠️ Technology Stack

- **Core**: React 19 (hooks, state managers, contexts)
- **Bundler**: Vite 8.0
- **Styling**: Tailwind CSS v4 (theme HSL color mappings)
- **Primitives**: Radix UI (`@radix-ui/react-dropdown-menu` for custom dropdown selections)
- **Icons**: Lucide React
- **API**: Jikan API v4 (MyAnimeList open-source REST API wrapper)

---

## 🚀 Getting Started

### Installation
Clone the repository and install dependencies from the `ui` folder:
```bash
cd ui
npm install
```

### Run Development Server
Spin up the hot-reloading dev environment locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the application.

### Code Linting
Run the ESLint suite to check for clean styling and React 19 configurations:
```bash
npm run lint
```

### Production Compilation
Build and bundle optimized static files:
```bash
npm run build
```

### GitHub Pages Deployment
To deploy the compiled application to GitHub Pages:
```bash
npm run deploy
```
*Note: Make sure your git remote is configured. If using SSH, run `git remote set-url origin git@github.com:Zenon-9/Anime-App.git` before deploying.*

---

## 📂 Project Architecture

```text
ui/src/
├── assets/         # Static visual assets
├── components/     # Reusable structural interfaces
│   ├── ui/         # Button, Input, Card, Dropdown-Menu primitives
│   ├── AnimeCard   # Anime catalog card layouts
│   ├── MangaCard   # Manga catalog card layouts
│   ├── FilterBar   # Dynamic list filters
│   ├── Header      # Navigation and profile controls
│   ├── Hero        # Landing slider promotions
│   ├── AnimeDetailModal      # Full details modal for anime titles
│   ├── MangaDetailModal      # Full details modal for manga titles
│   └── CharacterDetailModal  # Biography details modal for characters
├── context/        # State managers (Auth, Theme, Watchlist)
├── hooks/          # API loaders and fetch modules
├── pages/          # Layout contexts (Calendar, Compare, Landing, Login, Signup, Characters, Manga)
├── utils/          # Class mergers and alias configs
├── App.jsx         # Routing orchestration and view managers
├── index.css       # Tailwind v4 import layer and HSL styles
└── main.jsx        # App node mounter
```
