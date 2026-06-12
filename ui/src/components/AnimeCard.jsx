import { Star, Plus, Check } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { Button } from '@/components/ui/button';

export default function AnimeCard({ anime, onSelect }) {
  const { getWatchlistItem, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
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

  const score = anime.score ? anime.score.toFixed(1) : 'N/A';
  const typeStr = anime.type || 'TV';
  const epCount = anime.episodes ? `${anime.episodes} Ep` : '? Ep';
  const title = anime.title || anime.title_english || anime.title_japanese;
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  return (
    <div 
      className="flex flex-col h-[380px] overflow-hidden rounded-2xl border bg-card/40 text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      onClick={() => onSelect(anime.mal_id)}
    >
      {/* Poster Image Area */}
      <div className="relative h-[270px] w-full overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy" 
        />
        
        {/* Rating Badge */}
        {anime.score && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/50 flex items-center gap-1 text-[#fbbf24] text-xs font-bold shadow-sm">
            <Star size={12} fill="currentColor" />
            <span>{score}</span>
          </div>
        )}

        {/* Quick Watchlist Toggle */}
        <Button 
          onClick={handleQuickAction}
          variant={isSaved ? 'secondary' : 'outline'}
          size="icon"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow-sm bg-background/70 backdrop-blur-md border-border/50 cursor-pointer hover:scale-110 transition-transform ${
            isSaved ? 'bg-secondary text-primary border-primary/40' : 'text-foreground'
          }`}
          title={isSaved ? `Saved (${watchlistItem.status})` : 'Add to Plan to Watch'}
        >
          {isSaved ? <Check size={15} /> : <Plus size={15} />}
        </Button>

        {/* Bottom details overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex items-end p-3.5">
          <div className="flex justify-between items-center w-full">
            <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary/80 text-foreground text-[10px] font-semibold tracking-wider uppercase border border-border/40">
              {typeStr}
            </span>
            <span className="text-xs font-medium text-foreground">{epCount}</span>
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors" title={title}>
            {title}
          </h4>
          {(anime.studios?.[0]?.name || (anime.season && anime.year)) && (
            <span className="text-[10px] text-muted-foreground/80 block truncate">
              {anime.studios?.[0]?.name || 'Unknown Studio'}
              {anime.season && anime.year ? ` • ${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : ''}
            </span>
          )}
        </div>
        
        {/* Genre Tags Snippet */}
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex gap-1">
            {anime.genres.slice(0, 2).map((g) => (
              <span 
                key={g.mal_id} 
                className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 border text-muted-foreground"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
