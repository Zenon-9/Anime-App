import { useState, useEffect, useRef } from 'react';
import { useJikan } from '@/hooks/useJikan';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeftRight, X, Search, Loader2 } from 'lucide-react';

export default function ComparePage({ onSelectAnime, onSelectCharacter }) {
  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  
  const [charsA, setCharsA] = useState([]);
  const [charsB, setCharsB] = useState([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  
  const [activeSearchSlot, setActiveSearchSlot] = useState(null); // 'A' or 'B' or null
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const { loading, request } = useJikan();
  const debounceRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Close search overlay on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setActiveSearchSlot(null);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for slot selection
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 3) {
      Promise.resolve().then(() => {
        setSearchResults([]);
      });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const result = await request('/anime', { q: searchQuery, limit: 6 });
      if (result && result.data) {
        setSearchResults(result.data);
      }
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, request]);

  const selectAnimeForSlot = (anime, slot) => {
    if (slot === 'A') {
      setSlotA(anime);
    } else {
      setSlotB(anime);
    }
    setActiveSearchSlot(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const swapSlots = () => {
    const temp = slotA;
    setSlotA(slotB);
    setSlotB(temp);
    
    const tempChars = charsA;
    setCharsA(charsB);
    setCharsB(tempChars);
  };

  useEffect(() => {
    async function fetchCharacters() {
      if (!slotA && !slotB) {
        setCharsA([]);
        setCharsB([]);
        return;
      }
      setLoadingCharacters(true);
      try {
        if (slotA) {
          const charResA = await request(`/anime/${slotA.mal_id}/characters`);
          if (charResA && charResA.data) {
            setCharsA(charResA.data.slice(0, 8));
          } else {
            setCharsA([]);
          }
        } else {
          setCharsA([]);
        }

        if (slotB) {
          const charResB = await request(`/anime/${slotB.mal_id}/characters`);
          if (charResB && charResB.data) {
            setCharsB(charResB.data.slice(0, 8));
          } else {
            setCharsB([]);
          }
        } else {
          setCharsB([]);
        }
      } catch (err) {
        console.error("Error fetching characters for matchup:", err);
      } finally {
        setLoadingCharacters(false);
      }
    }
    fetchCharacters();
  }, [slotA?.mal_id, slotB?.mal_id, request]);

  // Helper to determine winner (higher score, lower rank/popularity since lower is better)
  const compareStats = (valA, valB, type = 'higher-better') => {
    if (valA === undefined || valA === null || valB === undefined || valB === null) {
      return { winner: null };
    }
    if (valA === valB) return { winner: 'tie' };
    
    if (type === 'higher-better') {
      return { winner: valA > valB ? 'A' : 'B' };
    } else {
      // lower is better (e.g. rank #5 is better than rank #20)
      return { winner: valA < valB ? 'A' : 'B' };
    }
  };

  const scoreResult = compareStats(slotA?.score, slotB?.score, 'higher-better');
  const rankResult = compareStats(slotA?.rank, slotB?.rank, 'lower-better');
  const popResult = compareStats(slotA?.popularity, slotB?.popularity, 'lower-better');
  const favResult = compareStats(slotA?.favorites, slotB?.favorites, 'higher-better');
  const epResult = compareStats(slotA?.episodes, slotB?.episodes, 'higher-better');

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-fade-in relative">
      
      {/* Page Title */}
      <div className="flex justify-between items-center border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="text-primary animate-pulse" size={24} />
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">Anime Matchup Deck</h2>
        </div>
        {slotA && slotB && (
          <Button variant="outline" size="sm" onClick={swapSlots} className="gap-1.5 rounded-xl cursor-pointer">
            <ArrowLeftRight size={14} />
            <span>Swap slots</span>
          </Button>
        )}
      </div>

      {/* Comparison Grid Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20">
        
        {/* Slot A */}
        <div className="relative">
          {slotA ? (
            <Card className="glass-panel border-muted overflow-hidden relative group">
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full w-8 h-8 bg-background/50 border-muted text-foreground cursor-pointer z-10"
                onClick={() => setSlotA(null)}
              >
                <X size={15} />
              </Button>
              <div className="h-44 relative overflow-hidden">
                <img 
                  src={slotA.images?.jpg?.large_image_url || slotA.images?.jpg?.image_url} 
                  alt="" 
                  className="w-full h-full object-cover blur-[15px] brightness-[0.35]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
              </div>
              <CardContent className="px-6 pb-6 -mt-16 relative z-10 flex gap-4 items-end">
                <img 
                  src={slotA.images?.jpg?.image_url} 
                  alt="" 
                  className="w-24 h-36 object-cover rounded-xl border shadow-md bg-muted cursor-pointer"
                  onClick={() => onSelectAnime(slotA.mal_id)}
                />
                <div className="flex-grow min-w-0 pr-8">
                  <h3 
                    className="font-extrabold text-base sm:text-lg text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors cursor-pointer"
                    onClick={() => onSelectAnime(slotA.mal_id)}
                  >
                    {slotA.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {slotA.studios?.[0]?.name || 'Unknown Studio'} • {slotA.type}
                    {slotA.season && slotA.year ? ` • ${slotA.season.charAt(0).toUpperCase() + slotA.season.slice(1)} ${slotA.year}` : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border border-dashed border-border/70 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-card/10 min-h-[190px]">
              <Search className="text-muted-foreground/30 mb-3" size={32} />
              <Button 
                onClick={() => setActiveSearchSlot('A')}
                variant="outline" 
                size="sm"
                className="rounded-xl border font-semibold px-6 cursor-pointer"
              >
                Choose Anime A
              </Button>
            </div>
          )}
        </div>

        {/* Slot B */}
        <div className="relative">
          {slotB ? (
            <Card className="glass-panel border-muted overflow-hidden relative group">
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full w-8 h-8 bg-background/50 border-muted text-foreground cursor-pointer z-10"
                onClick={() => setSlotB(null)}
              >
                <X size={15} />
              </Button>
              <div className="h-44 relative overflow-hidden">
                <img 
                  src={slotB.images?.jpg?.large_image_url || slotB.images?.jpg?.image_url} 
                  alt="" 
                  className="w-full h-full object-cover blur-[15px] brightness-[0.35]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
              </div>
              <CardContent className="px-6 pb-6 -mt-16 relative z-10 flex gap-4 items-end">
                <img 
                  src={slotB.images?.jpg?.image_url} 
                  alt="" 
                  className="w-24 h-36 object-cover rounded-xl border shadow-md bg-muted cursor-pointer"
                  onClick={() => onSelectAnime(slotB.mal_id)}
                />
                <div className="flex-grow min-w-0 pr-8">
                  <h3 
                    className="font-extrabold text-base sm:text-lg text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors cursor-pointer"
                    onClick={() => onSelectAnime(slotB.mal_id)}
                  >
                    {slotB.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {slotB.studios?.[0]?.name || 'Unknown Studio'} • {slotB.type}
                    {slotB.season && slotB.year ? ` • ${slotB.season.charAt(0).toUpperCase() + slotB.season.slice(1)} ${slotB.year}` : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border border-dashed border-border/70 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-card/10 min-h-[190px]">
              <Search className="text-muted-foreground/30 mb-3" size={32} />
              <Button 
                onClick={() => setActiveSearchSlot('B')}
                variant="outline" 
                size="sm"
                className="rounded-xl border font-semibold px-6 cursor-pointer"
              >
                Choose Anime B
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Inline Search Selector Dialogue Box */}
      {activeSearchSlot && (
        <div 
          ref={searchContainerRef}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-xl p-4 border bg-card rounded-2xl shadow-2xl z-30 animate-fade-in glass-panel glow-purple"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search to load Anime ${activeSearchSlot}...`}
              className="pl-9 h-10 border-muted placeholder:text-muted-foreground/60"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={16} />}
          </div>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-3 max-h-[300px] overflow-y-auto pr-1">
              {searchResults.map((anime) => (
                <div
                  key={anime.mal_id}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => selectAnimeForSlot(anime, activeSearchSlot)}
                >
                  <img 
                    src={anime.images?.jpg?.small_image_url || anime.images?.jpg?.image_url} 
                    alt="" 
                    className="w-10 h-14 object-cover rounded-md bg-muted flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-grow">
                    <span className="font-semibold text-sm truncate text-foreground">{anime.title}</span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      <span>{anime.type || 'TV'} ({anime.episodes || '?'} ep)</span>
                      <span>•</span>
                      <span className="text-[#fbbf24] font-medium">★ {anime.score || 'N/A'}</span>
                      {(anime.studios?.[0]?.name || (anime.season && anime.year)) && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{anime.studios?.[0]?.name || 'Unknown Studio'}</span>
                          {anime.season && anime.year && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{anime.season} {anime.year}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Comparison Metrics Column */}
      {slotA && slotB ? (
        <Card className="glass-panel border-muted w-full mt-6 relative z-10 animate-fade-in-up">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            
            {/* Score Metric Comparison */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span className={scoreResult.winner === 'A' ? 'text-primary font-extrabold' : ''}>
                  {scoreResult.winner === 'A' && '🏆 '}★ {slotA.score?.toFixed(2) || 'N/A'}
                </span>
                <span className="text-sm text-foreground font-heading">MAL Rating Score</span>
                <span className={scoreResult.winner === 'B' ? 'text-primary font-extrabold' : ''}>
                  {scoreResult.winner === 'B' && '🏆 '}★ {slotB.score?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_1fr] h-3.5 bg-muted rounded-full overflow-hidden border border-border/30">
                <div className="flex justify-end bg-muted pr-0.5">
                  <div 
                    className={`h-full rounded-l-full transition-all duration-500 ${
                      scoreResult.winner === 'A' ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${(slotA.score || 0) * 10}%` }}
                  ></div>
                </div>
                <div className="flex justify-start bg-muted pl-0.5">
                  <div 
                    className={`h-full rounded-r-full transition-all duration-500 ${
                      scoreResult.winner === 'B' ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${(slotB.score || 0) * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Rank Comparison */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span className={rankResult.winner === 'A' ? 'text-primary font-extrabold' : ''}>
                  {rankResult.winner === 'A' && '🏆 '}Rank #{slotA.rank || 'N/A'}
                </span>
                <span className="text-sm text-foreground font-heading">Global Rank</span>
                <span className={rankResult.winner === 'B' ? 'text-primary font-extrabold' : ''}>
                  {rankResult.winner === 'B' && '🏆 '}Rank #{slotB.rank || 'N/A'}
                </span>
              </div>
            </div>

            {/* Popularity Comparison */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span className={popResult.winner === 'A' ? 'text-primary font-extrabold' : ''}>
                  {popResult.winner === 'A' && '🏆 '}Popularity #{slotA.popularity || 'N/A'}
                </span>
                <span className="text-sm text-foreground font-heading">Popularity Rank</span>
                <span className={popResult.winner === 'B' ? 'text-primary font-extrabold' : ''}>
                  {popResult.winner === 'B' && '🏆 '}Popularity #{slotB.popularity || 'N/A'}
                </span>
              </div>
            </div>

            {/* Favorites / Members Comparison */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span className={favResult.winner === 'A' ? 'text-primary font-extrabold' : ''}>
                  {favResult.winner === 'A' && '🏆 '}{slotA.favorites?.toLocaleString() || 'N/A'}
                </span>
                <span className="text-sm text-foreground font-heading">MAL Favorites</span>
                <span className={favResult.winner === 'B' ? 'text-primary font-extrabold' : ''}>
                  {favResult.winner === 'B' && '🏆 '}{slotB.favorites?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>

            {/* Episode Count */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span className={epResult.winner === 'A' ? 'text-primary font-extrabold' : ''}>
                  {epResult.winner === 'A' && '🏆 '}{slotA.episodes || '?'} Episodes
                </span>
                <span className="text-sm text-foreground font-heading">Episode Count</span>
                <span className={epResult.winner === 'B' ? 'text-primary font-extrabold' : ''}>
                  {epResult.winner === 'B' && '🏆 '}{slotB.episodes || '?'} Episodes
                </span>
              </div>
            </div>

            {/* Release Date & Season */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span>{slotA.season && slotA.year ? `${slotA.season} ${slotA.year}` : 'Unknown'}</span>
                <span className="text-sm text-foreground font-heading">Premiere Date</span>
                <span>{slotB.season && slotB.year ? `${slotB.season} ${slotB.year}` : 'Unknown'}</span>
              </div>
            </div>

            {/* Primary Studio */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span className="text-foreground font-semibold truncate max-w-[200px]">
                  {slotA.studios?.map(s => s.name).join(', ') || 'Unknown'}
                </span>
                <span className="text-sm text-foreground font-heading">Animation Studio</span>
                <span className="text-foreground font-semibold truncate max-w-[200px]">
                  {slotB.studios?.map(s => s.name).join(', ') || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Content Age Rating */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground">
                <span className="text-foreground font-semibold truncate max-w-[200px]">
                  {slotA.rating || 'Unknown'}
                </span>
                <span className="text-sm text-foreground font-heading">Age Rating</span>
                <span className="text-foreground font-semibold truncate max-w-[200px]">
                  {slotB.rating || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Synopses side-by-side */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="text-center text-xs uppercase font-bold text-muted-foreground mb-2">
                Comparative Synopses
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
                <div className="p-4 rounded-xl border bg-muted/10 h-44 overflow-y-auto">
                  {slotA.synopsis || 'No synopsis available.'}
                </div>
                <div className="p-4 rounded-xl border bg-muted/10 h-44 overflow-y-auto">
                  {slotB.synopsis || 'No synopsis available.'}
                </div>
              </div>
            </div>

            {/* Characters side-by-side */}
            <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
              <div className="text-center text-xs uppercase font-bold text-muted-foreground mb-4">
                Main Cast & Characters Comparison
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Slot A Characters */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-foreground/80 mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="truncate max-w-[250px]">{slotA.title} Main Cast</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {charsA.length > 0 ? (
                      charsA.slice(0, 4).map((item) => (
                        <div 
                          key={item.character.mal_id} 
                          className="flex items-center gap-2.5 p-2 rounded-xl border bg-muted/10 hover:bg-muted/20 hover:border-primary/35 hover:scale-[1.02] cursor-pointer transition-all duration-300 group"
                          onClick={() => onSelectCharacter(item.character.mal_id)}
                        >
                          <img 
                            src={item.character.images?.jpg?.image_url} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0 border border-border/40 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="flex flex-col min-w-0 flex-grow">
                            <span className="font-bold text-[11px] text-foreground group-hover:text-primary transition-colors truncate" title={item.character.name}>
                              {item.character.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground tracking-wider uppercase font-semibold">
                              {item.role}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-6 text-xs text-muted-foreground italic bg-muted/5 rounded-xl border border-dashed">
                        {loadingCharacters ? 'Retrieving character archives...' : 'No character records found.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Slot B Characters */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-foreground/80 mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="truncate max-w-[250px]">{slotB.title} Main Cast</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {charsB.length > 0 ? (
                      charsB.slice(0, 4).map((item) => (
                        <div 
                          key={item.character.mal_id} 
                          className="flex items-center gap-2.5 p-2 rounded-xl border bg-muted/10 hover:bg-muted/20 hover:border-primary/35 hover:scale-[1.02] cursor-pointer transition-all duration-300 group"
                          onClick={() => onSelectCharacter(item.character.mal_id)}
                        >
                          <img 
                            src={item.character.images?.jpg?.image_url} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0 border border-border/40 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="flex flex-col min-w-0 flex-grow">
                            <span className="font-bold text-[11px] text-foreground group-hover:text-primary transition-colors truncate" title={item.character.name}>
                              {item.character.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground tracking-wider uppercase font-semibold">
                              {item.role}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-6 text-xs text-muted-foreground italic bg-muted/5 rounded-xl border border-dashed">
                        {loadingCharacters ? 'Retrieving character archives...' : 'No character records found.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      ) : (
        <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground my-6">
          <p className="max-w-xs leading-relaxed text-sm">
            Select two anime into the matchup slots above to load their comparative statistics.
          </p>
        </div>
      )}
    </div>
  );
}
