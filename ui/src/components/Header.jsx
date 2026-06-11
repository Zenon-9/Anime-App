import { useState, useEffect, useRef } from 'react';
import { Search, Heart, Sun, Moon, Compass, Loader2, LogOut, LogIn, Calendar, ArrowLeftRight } from 'lucide-react';
import { useJikan } from '@/hooks/useJikan';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Header({ currentPage, setCurrentPage, onSearch, onSelectAnime }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { loading, request } = useJikan();
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions fetch
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 3) {
      Promise.resolve().then(() => {
        setSuggestions([]);
      });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const result = await request('/anime', { q: searchQuery, limit: 5 });
      if (result && result.data) {
        setSuggestions(result.data);
      }
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, request]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setCurrentPage('search');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (anime) => {
    onSelectAnime(anime.mal_id);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-4 z-40 mx-4 sm:mx-6 lg:mx-8 mt-4 mb-6 px-6 py-3 rounded-2xl glass-panel border shadow-lg">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto flex-wrap sm:flex-nowrap">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => { setCurrentPage('landing'); setSearchQuery(''); }}
        >
          <Compass className="text-primary w-7 h-7 animate-pulse" />
          <span className="font-heading font-extrabold text-xl tracking-wider text-foreground">
            ANI<span className="text-primary">VERSE</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1.5 sm:gap-2 order-3 sm:order-none w-full sm:w-auto justify-center flex-wrap">
          <Button 
            variant={currentPage === 'home' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => { setCurrentPage('home'); setSearchQuery(''); }}
            className="flex items-center gap-1.5"
          >
            <Compass size={16} />
            <span>Discover</span>
          </Button>

          <Button 
            variant={currentPage === 'calendar' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => { setCurrentPage('calendar'); setSearchQuery(''); }}
            className="flex items-center gap-1.5"
          >
            <Calendar size={16} />
            <span>Schedule</span>
          </Button>

          <Button 
            variant={currentPage === 'compare' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => { setCurrentPage('compare'); setSearchQuery(''); }}
            className="flex items-center gap-1.5"
          >
            <ArrowLeftRight size={16} />
            <span>Compare</span>
          </Button>

          <Button 
            variant={currentPage === 'watchlist' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => {
              if (user) {
                setCurrentPage('watchlist');
                setSearchQuery('');
              } else {
                setCurrentPage('login');
              }
            }}
            className="flex items-center gap-1.5"
          >
            <Heart size={16} className={currentPage === 'watchlist' ? 'fill-current' : ''} />
            <span>My List</span>
          </Button>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <form onSubmit={handleSearchSubmit} className="relative" ref={containerRef}>
            <div className="relative w-48 sm:w-64 focus-within:w-56 sm:focus-within:w-72 transition-all duration-300">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search anime..."
                className="pl-9 pr-9 h-9 bg-background/50 border-muted placeholder:text-muted-foreground/60"
              />
              {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={14} />}
            </div>

            {/* Suggestions drop */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] sm:w-[350px] rounded-xl border bg-card p-1 shadow-xl z-50 animate-fade-in glass-panel">
                {suggestions.map((anime) => (
                  <div
                    key={anime.mal_id}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleSuggestionClick(anime)}
                  >
                    <img 
                      src={anime.images?.jpg?.small_image_url || anime.images?.jpg?.image_url} 
                      alt="" 
                      className="w-10 h-14 object-cover rounded-md bg-muted flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate text-foreground">{anime.title}</span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <span className="text-[#fbbf24] font-bold">★ {anime.score || 'N/A'}</span>
                        <span>•</span>
                        <span>{anime.type || 'TV'} ({anime.episodes || '?'} ep)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Theme switcher */}
          <Button 
            onClick={toggleTheme} 
            variant="outline" 
            size="icon" 
            className="w-9 h-9 bg-background/50 border-muted rounded-xl"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-primary" />}
          </Button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-3 rounded-xl gap-2 font-semibold text-xs text-foreground cursor-pointer hover:bg-muted/40">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline">
                      {user.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setCurrentPage('watchlist'); setSearchQuery(''); }}>
                    <Heart size={13} className="mr-2" />
                    <span>My Watchlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setCurrentPage('calendar'); setSearchQuery(''); }}>
                    <Calendar size={13} className="mr-2" />
                    <span>Airing Calendar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setCurrentPage('compare'); setSearchQuery(''); }}>
                    <ArrowLeftRight size={13} className="mr-2" />
                    <span>Compare Deck</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); setCurrentPage('landing'); }} className="text-destructive hover:bg-destructive/10">
                    <LogOut size={13} className="mr-2" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button 
              onClick={() => setCurrentPage('login')} 
              variant="outline" 
              size="sm"
              className="h-9 px-4 rounded-xl border bg-background/50 text-xs font-semibold"
            >
              <LogIn className="mr-1.5" size={14} />
              <span>Log In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
