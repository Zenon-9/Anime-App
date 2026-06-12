import { Star } from 'lucide-react';

export default function MangaCard({ manga, onSelect }) {
  const score = manga.score ? manga.score.toFixed(2) : 'N/A';
  const typeStr = manga.type || 'Manga';
  
  const volCount = manga.volumes ? `${manga.volumes} Vol` : '? Vol';
  const chapCount = manga.chapters ? `${manga.chapters} Ch` : '? Ch';
  
  const title = manga.title || manga.title_english || manga.title_japanese;
  const image = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url;
  
  // Format authors
  const authorStr = manga.authors && manga.authors.length > 0
    ? manga.authors.map(a => a.name).join(', ')
    : 'Unknown Author';

  return (
    <div 
      className="flex flex-col h-[380px] overflow-hidden rounded-2xl border bg-card/40 text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      onClick={() => onSelect(manga.mal_id)}
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
        {manga.score && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/50 flex items-center gap-1 text-[#fbbf24] text-xs font-bold shadow-sm">
            <Star size={12} fill="currentColor" />
            <span>{score}</span>
          </div>
        )}

        {/* Bottom details overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex items-end p-3.5">
          <div className="flex justify-between items-center w-full">
            <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary/80 text-foreground text-[10px] font-semibold tracking-wider uppercase border border-border/40">
              {typeStr}
            </span>
            <span className="text-xs font-medium text-foreground">{volCount} • {chapCount}</span>
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-1">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors" title={title}>
            {title}
          </h4>
          <span className="text-[10px] text-muted-foreground/80 block truncate">
            {authorStr}
          </span>
        </div>
      </div>
    </div>
  );
}
