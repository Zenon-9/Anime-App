import { useState, useEffect, useRef } from 'react';
import { useJikan } from '@/hooks/useJikan';
import { Search, Loader2, User, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function CharactersPage({ onSelectCharacter }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [characterList, setCharacterList] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ has_next_page: false, last_visible_page: 1 });
  
  const { loading, error, request } = useJikan();
  const debounceRef = useRef(null);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Fetch initial popular characters or run search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length === 0) {
      // Fetch default characters (Spike Spiegel, etc. based on Jikan default listing)
      async function fetchDefaultCharacters() {
        const result = await request('/characters', { limit: 20, page });
        if (result) {
          if (result.data) setCharacterList(result.data);
          if (result.pagination) {
            setPagination({
              has_next_page: result.pagination.has_next_page,
              last_visible_page: result.pagination.last_visible_page || 1
            });
          }
        }
      }
      fetchDefaultCharacters();
      return;
    }

    if (searchQuery.trim().length < 3) return;

    debounceRef.current = setTimeout(async () => {
      const result = await request('/characters', { q: searchQuery, limit: 20, page });
      if (result) {
        if (result.data) setCharacterList(result.data);
        if (result.pagination) {
          setPagination({
            has_next_page: result.pagination.has_next_page,
            last_visible_page: result.pagination.last_visible_page || 1
          });
        }
      }
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, page, request]);

  const handlePageChange = (direction) => {
    setPage((prev) => (direction === 'next' ? prev + 1 : Math.max(1, prev - 1)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="text-primary animate-pulse" size={24} />
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">Character Directory</h2>
          </div>
          {pagination.last_visible_page > 1 && (
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border">
              Page {page} of {pagination.last_visible_page}
            </span>
          )}
        </div>

        {/* Character Specific Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime characters..."
            className="pl-9 h-10 border-muted placeholder:text-muted-foreground/60 bg-background/50 focus-visible:ring-primary/45"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={16} />}
        </div>
      </div>

      {/* Grid Content */}
      {loading && characterList.length === 0 ? (
        /* Grid Skeletons */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border p-3 bg-card/25 shadow-sm">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-5 w-4/5 mt-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center p-12 text-center my-6">
          <h3 className="font-bold text-foreground">Network Connection Error</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1">{error}</p>
        </div>
      ) : characterList.length === 0 ? (
        <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center p-16 text-center my-6">
          <p className="text-sm text-muted-foreground">No characters match your search criteria. Try a different query.</p>
        </div>
      ) : (
        /* Characters Responsive Grid */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
          {characterList.map((char) => {
            const name = char.name;
            const kanji = char.name_kanji;
            const img = char.images?.jpg?.image_url;
            const favorites = char.favorites || 0;

            return (
              <div
                key={char.mal_id}
                onClick={() => onSelectCharacter(char.mal_id)}
                className="flex flex-col h-[320px] overflow-hidden rounded-2xl border bg-card/40 text-card-foreground shadow-sm hover:shadow-md hover:border-primary/45 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                {/* Image Section */}
                <div className="relative h-[220px] w-full overflow-hidden bg-muted">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Favorites badge overlay */}
                  {favorites > 0 && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/50 flex items-center gap-1 text-primary text-[10px] font-bold shadow-sm">
                      <Heart size={10} className="text-primary fill-current" />
                      <span>{favorites.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-1.5">
                  <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={name}>
                    {name}
                  </h4>
                  {kanji && (
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {kanji}
                    </span>
                  )}
                  <span className="text-[10px] text-primary/80 font-semibold tracking-wider block">
                    ID: #{char.mal_id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.last_visible_page > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 border-t border-border/40 pt-6">
          <Button
            onClick={() => handlePageChange('prev')}
            disabled={page === 1}
            variant="outline"
            className="gap-1 rounded-xl h-9 px-4 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </Button>
          
          <span className="text-sm font-semibold text-foreground">
            Page {page} of {pagination.last_visible_page}
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
    </div>
  );
}
