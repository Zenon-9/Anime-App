# Aniverse — Premium Anime Portal

**Aniverse** is a highly responsive, premium React-based web portal designed for discovering, tracking, and comparing anime titles. Powered by the Jikan API (MAL v4), it combines advanced layout designs, glassmorphism aesthetics, responsive viewports, and custom shadcn UI components.

---

## 🌟 Key Features

### 📅 Airing Calendar
- Dynamic weekly calendar schedule displaying anime airing by day (Monday through Sunday).
- Integrates loaders and caches schedule results to ensure high performance and smooth transition tabs.

### ⚔️ Compare Matchup Deck
- Side-by-side comparison engine. Load any two titles to compare MAL score ratings, global popularity ranks, member favorites, episode counts, animation studios, release seasons, age ratings, and comparative synopses.
- Includes a quick-search debounced selector panel for populating Slot A and Slot B inputs.

### 📊 Library Analytics & Watchlists
- **Multi-user Watchlist Isolation**: Mock authentication syncing user profiles locally to browser `localStorage`. Watchlists are isolated by username keys, allowing multiple registered users to track their lists independently.
- **Library Tracker**: Update watch status (Watching, Plan to Watch, Completed, Dropped), log episode progress (increment/decrement), and assign ratings.
- **Analytics Dashboard**: Automatic calculation of total watch time (converted to days, hours, minutes), average score, genre distribution charts, and total entries tracked.

### 🎭 Full Details Modal
- Renders trailer previews inside YouTube video overlays.
- Lists character records complete with localized voice actor details.
- Displays recommendation tabs based on user interest correlations.
- Styled using custom Radix-based shadcn dropdown menus for watch status and score rating selectors.

### 🌓 Aesthetic Theme Selectors
- Seamless Light / Dark theme selector syncing theme attributes to the DOM and saving user preferences across sessions.
- Premium styling: custom scrollbars, animated fade-ins, border rings, and dark glassmorphic cards.

---

## 🛠️ Technology Stack

- **Core**: React 19 (hooks, state managers, contexts)
- **Bundler**: Vite 8.0
- **Styling**: Tailwind CSS v4 (theme HSL color mappings)
- **Primitives**: Radix UI (`@radix-ui/react-dropdown-menu` for custom shadcn components)
- **Icons**: Lucide React
- **API**: Jikan API v4 (MyAnimeList open-source REST API wrapper)

---

## 🚀 Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (LTS recommended).

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Run Development Server
Spin up the hot-reloading dev environment locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the application.

### Code Linting
Run the ESLint suite to check for clean styling, hook regulations, and React 19 configurations:
```bash
npm run lint
```

### Production Compilation
Build and bundle optimized static files for deployment:
```bash
npm run build
```

---

## 📂 Project Architecture

```text
src/
├── assets/         # Static visual assets
├── components/     # Reusable structural interfaces
│   ├── ui/         # shadcn UI primitives (button, input, card, dropdown-menu, etc.)
│   ├── AnimeCard   # Anime catalog card layouts
│   ├── FilterBar   # Dynamic list selectors
│   ├── Header      # Responsive navigation and profile controls
│   └── Hero        # Landing slider promotions
├── context/        # State managers (Auth, Theme, Watchlist)
├── hooks/          # API loaders and fetch modules
├── pages/          # Major layout contexts (Calendar, Compare, Landing, Login, Signup)
├── utils/          # Class mergers and alias configs
├── App.jsx         # Routing orchestration and view managers
├── index.css       # Tailwind v4 import layer and HSL styles
└── main.jsx        # App node mounter
```
