import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Play, Plus, Check, Loader2, Star } from 'lucide-react';
import { useJikan } from '@/hooks/useJikan';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function AnimeDetailModal({ animeId, onClose, onSelectCharacter, onSelectAnime }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [details, setDetails] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);

  const { getWatchlistItem, addToWatchlist, updateWatchlistItem, removeFromWatchlist } = useWatchlist();
  const { user } = useAuth();
  const { loading, error, request } = useJikan();
  const dialogRef = useRef(null);

  const handleClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    onClose();
  }, [onClose]);

  // Fetch all required data
  useEffect(() => {
    if (!animeId) return;

    // Reset states in a microtask to avoid synchronous setState-in-effect warning
    Promise.resolve().then(() => {
      setDetails(null);
      setCharacters([]);
      setRecommendations([]);
      setReviews([]);
      setActiveTab('overview');
    });

    async function fetchAllDetails() {
      // 1. Fetch full details
      const fullRes = await request(`/anime/${animeId}/full`);
      if (fullRes && fullRes.data) {
        setDetails(fullRes.data);
      }

      // 2. Fetch characters
      const charRes = await request(`/anime/${animeId}/characters`);
      if (charRes && charRes.data) {
        setCharacters(charRes.data.slice(0, 8)); // top 8 characters
      }

      // 3. Fetch recommendations
      const recRes = await request(`/anime/${animeId}/recommendations`);
      if (recRes && recRes.data) {
        setRecommendations(recRes.data.slice(0, 6)); // top 6 recs
      }

      // 4. Fetch reviews
      const reviewRes = await request(`/anime/${animeId}/reviews`);
      if (reviewRes && reviewRes.data) {
        setReviews(reviewRes.data.slice(0, 4)); // top 4 reviews
      }
    }

    fetchAllDetails();
  }, [animeId, request]);

  // Open modal using showModal()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && animeId) {
      if (!dialog.open) {
        dialog.showModal();
      }
    }
  }, [animeId]);

  // Fallback for browsers that do not support closedby="any" (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event) => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        if (event.target !== dialog) return;

        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          handleClose();
        }
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, [animeId, handleClose]);

  if (!animeId) return null;

  const savedItem = details ? getWatchlistItem(details.mal_id) : null;
  const isSaved = !!savedItem;

  return (
    <dialog 
      ref={dialogRef} 
      closedby="any" 
      aria-labelledby="dialog-title"
      onClose={handleClose}
      className="fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none border-0 bg-background text-foreground overflow-y-auto animate-fade-in p-0 outline-none m-0 z-50 backdrop:bg-transparent"
    >
      {/* Floating Close Button */}
      <Button 
        onClick={handleClose} 
        variant="outline"
        size="icon"
        className="fixed top-6 right-6 sm:right-10 rounded-full w-10 h-10 bg-background/70 border backdrop-blur-md text-foreground cursor-pointer hover:rotate-90 hover:scale-105 transition-all duration-300 z-50 shadow-md"
        aria-label="Close Modal"
      >
        <X size={20} />
      </Button>

      {/* Floating Watchlist Toggle */}
      {details && (
        <Button 
          onClick={() => {
            if (isSaved) {
              removeFromWatchlist(details.mal_id);
            } else {
              addToWatchlist(details, 'Plan to Watch');
            }
          }} 
          variant={isSaved ? 'secondary' : 'outline'}
          size="icon"
          className={`fixed top-6 right-20 sm:right-24 rounded-full w-10 h-10 bg-background/70 border backdrop-blur-md cursor-pointer transition-all hover:scale-110 z-50 shadow-md ${
            isSaved ? 'text-primary border-primary/40' : 'text-foreground'
          }`}
          title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          {isSaved ? <Check size={20} /> : <Plus size={20} />}
        </Button>
      )}

      {loading && !details ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-medium text-muted-foreground">Fetching full archives...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 gap-4 text-center">
          <p className="text-destructive font-semibold">{error}</p>
          <Button onClick={handleClose}>Close Dialog</Button>
        </div>
      ) : details ? (
        <div className="flex flex-col min-h-screen">
          {/* Header Banner */}
          <div className="relative h-72 overflow-hidden">
            <img 
              src={details.images?.jpg?.large_image_url || details.images?.jpg?.image_url} 
              alt="" 
              className="w-full h-full object-cover blur-[12px] brightness-[0.35] scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          </div>

          {/* Main Info Columns */}
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[250px_1fr] px-6 sm:px-10 pb-16 gap-10 -mt-24 relative z-10">
            {/* Sidebar with poster and watchlist state */}
            <div className="flex flex-col gap-5">
              <img 
                src={details.images?.jpg?.large_image_url || details.images?.jpg?.image_url} 
                alt={details.title} 
                className="w-full max-w-[240px] h-[340px] object-cover rounded-2xl border shadow-md bg-muted mx-auto md:mx-0"
              />
              
              {/* Watchlist Manager */}
              <div className="p-4 rounded-2xl border bg-muted/30 flex flex-col gap-3">
                <h4 className="text-sm font-bold text-foreground">Library Tracker</h4>
                {isSaved ? (
                  <div className="flex flex-col gap-3">
                     <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Status</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="h-9 w-full justify-between px-3 rounded-md text-xs font-semibold cursor-pointer bg-background/80 border-input text-foreground"
                          >
                            <span>{savedItem.status}</span>
                            <span className="text-muted-foreground/60 text-[10px]">▼</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[206px]">
                          {['Watching', 'Plan to Watch', 'Completed', 'Dropped'].map((status) => (
                            <DropdownMenuItem 
                              key={status} 
                              onClick={() => updateWatchlistItem(details.mal_id, { status })}
                              className={savedItem.status === status ? "bg-primary/10 text-primary font-bold" : ""}
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Episodes</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={details.episodes || 9999}
                          value={savedItem.progress}
                          onChange={(e) => updateWatchlistItem(details.mal_id, { progress: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                          className="w-16 h-8 text-center px-1 font-semibold"
                        />
                        <span className="text-sm text-muted-foreground">/</span>
                        <span className="text-sm font-semibold text-foreground">{details.episodes || '?'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">My Rating</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="h-9 w-full justify-between px-3 rounded-md text-xs font-bold cursor-pointer bg-background/80 border-input text-[#fbbf24]"
                          >
                            <span>{savedItem.user_score > 0 ? `★ ${savedItem.user_score}` : 'Unrated'}</span>
                            <span className="text-muted-foreground/60 text-[10px]">▼</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[206px] max-h-56 overflow-y-auto">
                          <DropdownMenuItem 
                            onClick={() => updateWatchlistItem(details.mal_id, { user_score: 0 })}
                            className={savedItem.user_score === 0 ? "bg-accent text-accent-foreground font-bold" : ""}
                          >
                            Unrated
                          </DropdownMenuItem>
                          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                            <DropdownMenuItem 
                              key={num} 
                              onClick={() => updateWatchlistItem(details.mal_id, { user_score: num })}
                              className={savedItem.user_score === num ? "bg-primary/10 text-primary font-bold" : "text-[#fbbf24]"}
                            >
                              ★ {num}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Button 
                      onClick={() => removeFromWatchlist(details.mal_id)}
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-xs font-semibold mt-1"
                    >
                      Delete Tracker
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      if (user) {
                        addToWatchlist(details, 'Plan to Watch');
                      } else {
                        handleClose();
                        // Delay slightly to prevent click interference
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 50);
                      }
                    }}
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add to Watchlist</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Main content pane */}
            <div className="flex flex-col gap-6 mt-6 md:mt-24">
              <div className="flex flex-col gap-2">
                <h2 id="dialog-title" className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight font-heading">
                  {details.title}
                </h2>
                {details.title_english && details.title_english !== details.title && (
                  <h3 className="text-sm font-semibold text-muted-foreground">{details.title_english}</h3>
                )}
                
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {details.score && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase">
                      <Star size={10} fill="currentColor" className="text-[#fbbf24]" />
                      <span>★ {details.score.toFixed(1)}</span>
                    </span>
                  )}
                  {details.rank && (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary/80 text-foreground text-[10px] font-semibold uppercase border border-border/50">
                      Rank #{details.rank}
                    </span>
                  )}
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-muted/65 text-muted-foreground text-[10px] font-semibold border border-border/30">
                    {details.type || 'TV'}
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                    {details.status || 'Finished'}
                  </span>
                </div>
              </div>

              {/* Tabs Navbar */}
              <div className="flex border-b border-border/40 gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-px">
                {['overview', 'media', 'characters', 'recommendations', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab 
                        ? 'text-primary border-primary' 
                        : 'text-muted-foreground border-transparent hover:text-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="min-h-[250px]">
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-foreground">Synopsis</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                        {details.synopsis || 'No synopsis available.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border/40 pt-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Episodes</span>
                        <span className="text-sm font-bold mt-0.5">{details.episodes || 'Unknown'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Duration</span>
                        <span className="text-sm font-bold mt-0.5">{details.duration || 'Unknown'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Source</span>
                        <span className="text-sm font-bold mt-0.5">{details.source || 'Original'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Studios</span>
                        <span className="text-sm font-bold mt-0.5 truncate">{details.studios?.map(s => s.name).join(', ') || 'Unknown'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Premiered</span>
                        <span className="text-sm font-bold mt-0.5">
                          {details.season && details.year ? `${details.season} ${details.year}` : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Popularity</span>
                        <span className="text-sm font-bold mt-0.5">#{details.popularity || 'Unknown'}</span>
                      </div>
                    </div>

                    {details.genres && details.genres.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-foreground">Genres</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {details.genres.map(g => (
                            <span key={g.mal_id} className="text-xs px-2.5 py-0.5 rounded-md border bg-muted/30">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="animate-fade-in">
                    {details.trailer?.youtube_id ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-lg bg-black">
                        <iframe
                          title={`${details.title} Trailer`}
                          src={`https://www.youtube.com/embed/${details.trailer.youtube_id}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 border rounded-2xl bg-muted/20 text-center">
                        <Play size={32} className="text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No preview trailer available for this archive.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'characters' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                    {characters.length > 0 ? (
                      characters.map((item) => (
                        <div 
                          key={item.character.mal_id} 
                          className="flex items-center gap-3 p-2.5 rounded-xl border bg-muted/10 hover:bg-muted/20 hover:border-primary/30 transition-all duration-300 relative overflow-hidden cursor-pointer group"
                          onClick={() => onSelectCharacter(item.character.mal_id)}
                        >
                          <img 
                            src={item.character.images?.jpg?.image_url} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="flex flex-col min-w-0 pr-12 flex-grow">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{item.character.name}</span>
                            <span className="text-[10px] text-muted-foreground">{item.role} Character</span>
                            {item.voice_actors && item.voice_actors.length > 0 && (
                              <span className="text-xs text-primary font-medium truncate mt-1">
                                VA: {item.voice_actors[0].person.name} ({item.voice_actors[0].language})
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center col-span-2 py-8">No characters archived.</p>
                    )}
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 animate-fade-in">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec) => {
                        const recAnime = rec.entry;
                        return (
                          <div 
                            key={recAnime.mal_id} 
                            className="group flex flex-col gap-2 cursor-pointer"
                            onClick={() => {
                              onSelectAnime(recAnime.mal_id);
                            }}
                          >
                            <div className="relative overflow-hidden rounded-xl aspect-[3/4] border bg-muted">
                              <img 
                                src={recAnime.images?.jpg?.image_url} 
                                alt="" 
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <span className="font-semibold text-xs text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                              {recAnime.title}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center col-span-6 py-8">No recommendation links available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="flex flex-col gap-4 animate-fade-in max-h-[400px] overflow-y-auto pr-1">
                    {reviews.length > 0 ? (
                      reviews.map((rev, idx) => {
                        const formattedDate = rev.date ? new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date';
                        const userImg = rev.user?.images?.jpg?.image_url;
                        return (
                          <div key={idx} className="flex flex-col gap-3 p-4 rounded-2xl border bg-muted/10">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                {userImg ? (
                                  <img 
                                    src={userImg} 
                                    alt="" 
                                    className="w-9 h-9 rounded-full object-cover border bg-muted"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border">
                                    {rev.user?.username?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-foreground">{rev.user?.username || 'Anonymous'}</span>
                                  <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                                </div>
                              </div>
                              {rev.score && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase">
                                  ★ {rev.score}/10
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line bg-muted/5 p-3 rounded-xl border border-border/20">
                              {rev.review || 'No review content.'}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8 italic">No user reviews archived for this entry.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
