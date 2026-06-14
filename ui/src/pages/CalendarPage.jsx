import { useState, useEffect } from 'react';
import { useJikan } from '@/hooks/useJikan';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Clock, AlertCircle, Plus, Check } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';

const WEEKDAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' }
];

export default function CalendarPage({ onSelectAnime }) {
  const [activeDay, setActiveDay] = useState(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const malDayMapping = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return malDayMapping[dayIndex];
  });
  const [scheduleList, setScheduleList] = useState([]);
  const { loading, error, request } = useJikan();
  const { getWatchlistItem, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    async function fetchSchedules() {
      // Jikan API expects schedules filter to be lower-case weekday name
      const result = await request('/schedules', { filter: activeDay });
      if (result && result.data) {
        // Jikan sometimes returns duplicates or uncategorized items, let's filter out and sort
        const items = result.data;
        // Sort by airing time if broadcast info exists
        const sorted = [...items].sort((a, b) => {
          const timeA = a.broadcast?.time || '99:99';
          const timeB = b.broadcast?.time || '99:99';
          return timeA.localeCompare(timeB);
        });
        setScheduleList(sorted);
      }
    }
    fetchSchedules();
  }, [activeDay, request]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary animate-pulse" size={24} />
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">Airing Schedule</h2>
        </div>
        
        {/* Weekday Selector Button Group */}
        <div className="flex flex-wrap justify-center md:justify-start gap-1 bg-muted/30 border p-1 rounded-xl">
          {WEEKDAYS.map((day) => (
            <Button
              key={day.value}
              onClick={() => setActiveDay(day.value)}
              variant={activeDay === day.value ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                activeDay === day.value ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {day.label.substring(0, 3)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        /* Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-2xl bg-card/25 shadow-sm">
              <Skeleton className="w-16 h-24 rounded-lg flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-grow justify-center">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center p-12 text-center my-6">
          <AlertCircle size={36} className="text-rose-500 mb-2 animate-bounce" />
          <h3 className="font-bold text-foreground">Schedule Load Error</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1">{error}</p>
        </div>
      ) : scheduleList.length === 0 ? (
        <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center p-16 text-center my-6">
          <p className="text-sm text-muted-foreground">No anime scheduled to air on {activeDay}.</p>
        </div>
      ) : (
        /* Schedule Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scheduleList.map((anime) => {
            const time = anime.broadcast?.time || null;
            const timezone = anime.broadcast?.timezone || 'JST';
            const studio = anime.studios?.[0]?.name || 'Unknown Studio';
            const score = anime.score ? anime.score.toFixed(1) : 'N/A';
            const title = anime.title || anime.title_english || anime.title_japanese;

            const watchlistItem = getWatchlistItem(anime.mal_id);
            const isSaved = !!watchlistItem;

            const handleQuickAction = (e) => {
              e.stopPropagation();
              if (isSaved) {
                removeFromWatchlist(anime.mal_id);
              } else {
                addToWatchlist(anime, 'Plan to Watch');
              }
            };

            return (
              <div 
                key={anime.mal_id}
                onClick={() => onSelectAnime(anime.mal_id)}
                className="flex gap-4 p-4 border rounded-2xl bg-card/45 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group relative"
              >
                <img 
                  src={anime.images?.jpg?.image_url} 
                  alt="" 
                  className="w-16 h-24 object-cover rounded-lg border bg-muted flex-shrink-0"
                  loading="lazy"
                />
                
                <div className="flex flex-col justify-between min-w-0 flex-grow pr-8">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2" title={title}>
                      {title}
                    </h3>
                    <span className="text-xs text-muted-foreground block">{studio}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    {time && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <Clock size={12} />
                        <span>{time} {timezone}</span>
                      </span>
                    )}
                    
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#fbbf24]">
                      <Star size={11} fill="currentColor" />
                      <span>{score}</span>
                    </span>
                  </div>
                </div>

                {/* Quick Watchlist Toggle */}
                <Button 
                  onClick={handleQuickAction}
                  variant={isSaved ? 'secondary' : 'outline'}
                  size="icon"
                  className={`absolute top-4 right-4 w-7 h-7 rounded-full shadow-sm bg-background/70 backdrop-blur-md border-border/50 cursor-pointer hover:scale-110 transition-transform ${
                    isSaved ? 'bg-secondary text-primary border-primary/40' : 'text-foreground'
                  }`}
                  title={isSaved ? `Saved (${watchlistItem.status})` : 'Add to Plan to Watch'}
                >
                  {isSaved ? <Check size={13} /> : <Plus size={13} />}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
