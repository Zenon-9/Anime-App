import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POPULAR_GENRES = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 30, name: 'Sports' },
  { id: 37, name: 'Supernatural' }
];

export default function FilterBar({ filters, setFilters, onReset }) {
  const handleGenreToggle = (genreId) => {
    setFilters((prev) => {
      const currentGenres = prev.genres ? prev.genres.split(',') : [];
      const idStr = String(genreId);
      
      let newGenres;
      if (currentGenres.includes(idStr)) {
        newGenres = currentGenres.filter(g => g !== idStr);
      } else {
        newGenres = [...currentGenres, idStr];
      }
      
      return {
        ...prev,
        genres: newGenres.join(','),
        page: 1
      };
    });
  };

  const handleSelectChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const selectedGenres = filters.genres ? filters.genres.split(',') : [];

  return (
    <div className="glass-panel mx-4 sm:mx-6 lg:mx-8 mb-6 p-5 sm:p-6 rounded-2xl border flex flex-col gap-4 animate-fade-in">
      {/* Top filters row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary animate-pulse" />
          <h3 className="font-heading font-bold text-foreground">Filters & Sorting</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) => handleSelectChange('type', e.target.value)}
            className="flex h-9 min-w-[130px] rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Formats</option>
            <option value="tv">TV Series</option>
            <option value="movie">Movie</option>
            <option value="ova">OVA</option>
            <option value="special">Special</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleSelectChange('status', e.target.value)}
            className="flex h-9 min-w-[130px] rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="airing">Airing Now</option>
            <option value="complete">Finished</option>
            <option value="upcoming">Upcoming</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filters.rating || ''}
            onChange={(e) => handleSelectChange('rating', e.target.value)}
            className="flex h-9 min-w-[130px] rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Ratings</option>
            <option value="g">G - All Ages</option>
            <option value="pg">PG - Children</option>
            <option value="pg13">PG-13 - Teens</option>
            <option value="r17">R - 17+</option>
            <option value="r">R+ - Mild Nudity</option>
          </select>

          {/* Sort Order */}
          <select
            value={filters.order_by || 'popularity'}
            onChange={(e) => handleSelectChange('order_by', e.target.value)}
            className="flex h-9 min-w-[130px] rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="popularity">Most Popular</option>
            <option value="score">Highest Rated</option>
            <option value="title">Alphabetical</option>
            <option value="episodes">Episode Count</option>
          </select>

          {/* Reset Filters */}
          <Button 
            onClick={onReset} 
            variant="outline"
            size="sm"
            className="h-9 border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-destructive gap-1.5 px-3 rounded-lg"
          >
            <Trash2 size={15} />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Genres row */}
      <div className="flex items-center gap-3 border-t border-border/40 pt-4 flex-wrap sm:flex-nowrap">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">Genres:</span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(String(genre.id));
            return (
              <Button
                key={genre.id}
                onClick={() => handleGenreToggle(genre.id)}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`h-7 px-3 text-xs rounded-full border-muted bg-background/50 hover:bg-accent ${
                  isSelected ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/95 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {genre.name}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
