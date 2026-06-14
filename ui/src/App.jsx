import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { useJikan } from './hooks/useJikan';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import AnimeCard from './components/AnimeCard';
import AnimeDetailModal from './components/AnimeDetailModal';
import WatchlistDashboard from './components/WatchlistDashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CalendarPage from './pages/CalendarPage';
import ComparePage from './pages/ComparePage';
import CharactersPage from './pages/CharactersPage';
import CharacterDetailModal from './components/CharacterDetailModal';
import MangaPage from './pages/MangaPage';
import MangaDetailModal from './components/MangaDetailModal';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';
import { ChevronLeft, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';

const INITIAL_FILTERS = {
  page: 1,
  limit: 20,
  type: '',
  rating: '',
  status: '',
  order_by: 'popularity',
  sort: 'desc',
  genres: ''
};

function MainApp() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' is default
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimeId, setSelectedAnimeId] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [selectedMangaId, setSelectedMangaId] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [animeList, setAnimeList] = useState([]);
  const [pagination, setPagination] = useState({ has_next_page: false, last_visible_page: 1 });

  const { loading, error, request } = useJikan();
  const { user } = useAuth();

  // Load Anime Grid Data
  const loadAnimeData = useCallback(async () => {
    let endpoint = '/anime';
    let params = { ...filters };

    // If on home/discover page and no active search queries and no filters are touched (besides default page/limit/popularity),
    // fetch seasonal now (trending now) to keep home page extremely dynamic and relevant!
    const isFiltersDefault = 
      filters.type === '' && 
      filters.rating === '' && 
      filters.status === '' && 
      filters.genres === '';

    if (currentPage === 'home' && !searchQuery && isFiltersDefault) {
      endpoint = '/seasons/now';
      params = {
        page: filters.page,
        limit: filters.limit
      };
    } else if (searchQuery) {
      params.q = searchQuery;
    }

    const result = await request(endpoint, params);
    if (result) {
      if (result.data) {
        setAnimeList(result.data);
      }
      if (result.pagination) {
        setPagination({
          has_next_page: result.pagination.has_next_page,
          last_visible_page: result.pagination.last_visible_page || 1
        });
      }
    }
  }, [filters, searchQuery, currentPage, request]);

  // Fetch when page, query or filters change
  useEffect(() => {
    if (currentPage === 'home' || currentPage === 'search') {
      Promise.resolve().then(() => {
        loadAnimeData();
      });
    }
  }, [loadAnimeData, currentPage]);

  // Redirect to login if accessing watchlist unauthenticated
  useEffect(() => {
    if (currentPage === 'watchlist' && !user) {
      Promise.resolve().then(() => {
        setCurrentPage('login');
      });
    }
  }, [currentPage, user]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters({
      ...INITIAL_FILTERS,
      order_by: 'popularity'
    });
    setCurrentPage('search');
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
    if (currentPage === 'search') {
      setCurrentPage('home');
    }
  };

  const handlePageChange = (direction) => {
    setFilters((prev) => {
      const nextPage = direction === 'next' ? prev.page + 1 : Math.max(1, prev.page - 1);
      return {
        ...prev,
        page: nextPage
      };
    });
    // Scroll to filters top smoothly
    const element = document.querySelector('.filter-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine section headers
  const getSectionTitle = () => {
    if (currentPage === 'search') {
      return `Search Results for "${searchQuery}"`;
    }
    const isFiltersDefault = 
      filters.type === '' && 
      filters.rating === '' && 
      filters.status === '' && 
      filters.genres === '';
    
    return isFiltersDefault ? 'Trending This Season' : 'Discovered Anime';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          if (page === 'home') {
            setSearchQuery('');
            setFilters(INITIAL_FILTERS);
          }
        }}
        onSearch={handleSearch}
        onSelectAnime={setSelectedAnimeId}
      />

      {/* Main Layout Area */}
      <main className="flex-grow">
        {currentPage === 'landing' && (
          <LandingPage 
            setCurrentPage={setCurrentPage} 
            onSelectAnime={setSelectedAnimeId}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'signup' && (
          <SignupPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'watchlist' && user && (
          <WatchlistDashboard 
            onSelectAnime={setSelectedAnimeId}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'calendar' && (
          <CalendarPage 
            onSelectAnime={setSelectedAnimeId}
          />
        )}

        {currentPage === 'characters' && (
          <CharactersPage 
            onSelectCharacter={setSelectedCharacterId}
          />
        )}

        {currentPage === 'manga' && (
          <MangaPage 
            onSelectManga={setSelectedMangaId}
          />
        )}

        {currentPage === 'compare' && (
          <ComparePage 
            onSelectAnime={setSelectedAnimeId}
            onSelectCharacter={setSelectedCharacterId}
          />
        )}

        {(currentPage === 'home' || currentPage === 'search') && (
          <>
            {currentPage === 'home' && !searchQuery && (
              <Hero onSelectAnime={setSelectedAnimeId} />
            )}

            {/* Anchor point for pagination scrolling */}
            <div className="filter-anchor"></div>
            
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />

            {/* Grid section */}
            <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto w-full flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">{getSectionTitle()}</h2>
                {pagination.last_visible_page > 1 && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    Page {filters.page} of {pagination.last_visible_page}
                  </span>
                )}
              </div>

              {loading ? (
                /* Premium Grid Skeleton Loading using our shadcn Skeleton */
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-2xl border p-3 bg-card/25 shadow-sm">
                      <Skeleton className="h-[230px] w-full rounded-xl" />
                      <Skeleton className="h-5 w-4/5 mt-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center p-12 text-center my-6">
                  <AlertTriangle size={36} className="text-rose-500 mb-2 animate-bounce" />
                  <h3 className="font-bold text-foreground">API Connection Error</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mt-1">{error}</p>
                  <Button onClick={loadAnimeData} className="mt-4 font-semibold px-6">
                    <RefreshCw size={14} className="mr-1.5" />
                    <span>Try Again</span>
                  </Button>
                </div>
              ) : animeList.length === 0 ? (
                <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center p-12 text-center my-6">
                  <p className="text-sm text-muted-foreground">No matches found. Try adjusting the filter settings.</p>
                  <Button onClick={handleResetFilters} className="mt-4 font-semibold px-6">
                    Reset Catalog
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    {animeList.map((anime) => (
                      <AnimeCard
                        key={anime.mal_id}
                        anime={anime}
                        onSelect={setSelectedAnimeId}
                      />
                    ))}
                  </div>

                  {/* Pagination Footer */}
                  {pagination.last_visible_page > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <Button
                        onClick={() => handlePageChange('prev')}
                        disabled={filters.page === 1}
                        variant="outline"
                        className="gap-1 rounded-xl h-9 px-4 cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                        <span>Previous</span>
                      </Button>
                      
                      <span className="text-sm font-semibold text-foreground">
                        Page {filters.page} of {pagination.last_visible_page}
                      </span>
                      
                      <Button
                        onClick={() => handlePageChange('next')}
                        disabled={!pagination.has_next_page}
                        variant="outline"
                        className="gap-1 rounded-xl h-9 px-4 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>

      {/* Global Details Modal dialog */}
      <AnimeDetailModal
        animeId={selectedAnimeId}
        onClose={() => setSelectedAnimeId(null)}
        onSelectCharacter={setSelectedCharacterId}
        onSelectAnime={setSelectedAnimeId}
      />

      {/* Global Character Details Modal dialog */}
      <CharacterDetailModal
        characterId={selectedCharacterId}
        onClose={() => setSelectedCharacterId(null)}
        onSelectAnime={(animeId) => {
          setSelectedCharacterId(null);
          setTimeout(() => {
            setSelectedAnimeId(animeId);
          }, 50);
        }}
        onSelectManga={(mangaId) => {
          setSelectedCharacterId(null);
          setTimeout(() => {
            setSelectedMangaId(mangaId);
          }, 50);
        }}
      />

      {/* Global Manga Details Modal dialog */}
      <MangaDetailModal
        mangaId={selectedMangaId}
        onClose={() => setSelectedMangaId(null)}
        onSelectCharacter={setSelectedCharacterId}
        onSelectManga={setSelectedMangaId}
      />

      {/* Footer Branding */}
      <footer className="border-t border-border/40 py-8 px-4 text-center bg-card/20 flex flex-col gap-1.5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Aniverse. Built with React, Tailwind CSS, & shadcn/ui.</p>
        <p className="opacity-75">Data sourced from MAL via Jikan API v4.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <MainApp />
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
