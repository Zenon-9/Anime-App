import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Loader2, Star, BookOpen } from 'lucide-react';
import { useJikan } from '@/hooks/useJikan';
import { Button } from '@/components/ui/button';

export default function MangaDetailModal({ mangaId, onClose, onSelectCharacter }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [details, setDetails] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);

  const { loading, error, request } = useJikan();
  const dialogRef = useRef(null);

  const handleClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    onClose();
  }, [onClose]);

  // Fetch all details
  useEffect(() => {
    if (!mangaId) return;

    Promise.resolve().then(() => {
      setDetails(null);
      setCharacters([]);
      setRecommendations([]);
      setReviews([]);
      setActiveTab('overview');
    });

    async function fetchMangaDetails() {
      // 1. Fetch full details
      const fullRes = await request(`/manga/${mangaId}/full`);
      if (fullRes && fullRes.data) {
        setDetails(fullRes.data);
      }

      // 2. Fetch characters
      const charRes = await request(`/manga/${mangaId}/characters`);
      if (charRes && charRes.data) {
        setCharacters(charRes.data.slice(0, 8)); // top 8 characters
      }

      // 3. Fetch recommendations
      const recRes = await request(`/manga/${mangaId}/recommendations`);
      if (recRes && recRes.data) {
        setRecommendations(recRes.data.slice(0, 6)); // top 6 recs
      }

      // 4. Fetch reviews
      const reviewRes = await request(`/manga/${mangaId}/reviews`);
      if (reviewRes && reviewRes.data) {
        setReviews(reviewRes.data.slice(0, 4)); // top 4 reviews
      }
    }

    fetchMangaDetails();
  }, [mangaId, request]);

  // Open modal using showModal()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && mangaId) {
      if (!dialog.open) {
        dialog.showModal();
      }
    }
  }, [mangaId]);

  // Fallback backdrop click for dialog closing
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
  }, [mangaId, handleClose]);

  if (!mangaId) return null;

  const score = details?.score ? details.score.toFixed(2) : 'N/A';
  const authorStr = details?.authors && details.authors.length > 0
    ? details.authors.map(a => a.name).join(', ')
    : 'Unknown Author';

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="manga-dialog-title"
      onClose={handleClose}
      className="m-auto max-h-[85vh] w-[92%] max-w-[900px] rounded-3xl border bg-card text-card-foreground shadow-2xl overflow-y-auto animate-fade-in p-0 outline-none backdrop:backdrop-blur-md backdrop:bg-background/80"
    >
      {loading && !details ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-medium text-muted-foreground">Fetching complete manga archives...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 gap-4 text-center">
          <p className="text-destructive font-semibold">{error}</p>
          <Button onClick={handleClose}>Close Dialog</Button>
        </div>
      ) : details ? (
        <div className="flex flex-col">
          {/* Header Banner Background */}
          <div className="relative h-44 overflow-hidden">
            <img
              src={details.images?.jpg?.large_image_url || details.images?.jpg?.image_url}
              alt=""
              className="w-full h-full object-cover blur-[12px] brightness-[0.35] scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>

            <Button
              onClick={handleClose}
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 rounded-full w-9 h-9 bg-background/50 border-muted text-foreground cursor-pointer hover:rotate-90 transition-transform duration-300 z-50"
              aria-label="Close Modal"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Main Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] px-6 sm:px-10 pb-10 gap-8 -mt-20 relative z-10">
            {/* Left Column: Poster & Metadata */}
            <div className="flex flex-col gap-4">
              <img
                src={details.images?.jpg?.large_image_url || details.images?.jpg?.image_url}
                alt={details.title}
                className="w-full max-w-[240px] h-[340px] object-cover rounded-2xl border shadow-md bg-muted mx-auto md:mx-0"
              />

              <div className="p-4 rounded-2xl border bg-muted/30 flex flex-col gap-2.5 text-xs text-muted-foreground">
                <div>
                  <span className="font-bold text-foreground block">Author(s)</span>
                  <span>{authorStr}</span>
                </div>
                <div>
                  <span className="font-bold text-foreground block">Published</span>
                  <span>{details.published?.string || 'Unknown'}</span>
                </div>
                {details.serialization && details.serialization.length > 0 && (
                  <div>
                    <span className="font-bold text-foreground block">Serialization</span>
                    <span>{details.serialization.map(s => s.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex flex-col gap-6 mt-6 md:mt-24">
              <div>
                <h2 id="manga-dialog-title" className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight font-heading">
                  {details.title}
                </h2>
                {details.title_english && details.title_english !== details.title && (
                  <h3 className="text-sm font-semibold text-muted-foreground mt-0.5">{details.title_english}</h3>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {details.score && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase">
                      <Star size={10} fill="currentColor" className="text-[#fbbf24]" />
                      <span>★ {score}</span>
                    </span>
                  )}
                  {details.rank && (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary/80 text-foreground text-[10px] font-semibold uppercase border border-border/50">
                      Rank #{details.rank}
                    </span>
                  )}
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-muted/65 text-muted-foreground text-[10px] font-semibold border border-border/30">
                    {details.type || 'Manga'}
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                    {details.status || 'Publishing'}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border/40 gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('characters')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'characters'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Characters ({characters.length})
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'recommendations'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Recommendations ({recommendations.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[250px]">
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-foreground">Synopsis</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line max-h-52 overflow-y-auto pr-1">
                        {details.synopsis || 'No synopsis available.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border/40 pt-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Volumes</span>
                        <span className="text-sm font-bold mt-0.5">{details.volumes || 'Unknown'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Chapters</span>
                        <span className="text-sm font-bold mt-0.5">{details.chapters || 'Unknown'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-muted-foreground">Popularity</span>
                        <span className="text-sm font-bold mt-0.5">#{details.popularity || 'Unknown'}</span>
                      </div>
                    </div>

                    {details.genres && details.genres.length > 0 && (
                      <div className="space-y-2 border-t border-border/40 pt-6">
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

                {activeTab === 'characters' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                    {characters.length > 0 ? (
                      characters.map((item) => (
                        <div
                          key={item.character.mal_id}
                          className="flex items-center gap-3 p-2.5 rounded-xl border bg-muted/10 hover:bg-muted/20 hover:border-primary/30 transition-all duration-300 relative overflow-hidden cursor-pointer group"
                          onClick={() => {
                            handleClose();
                            setTimeout(() => {
                              onSelectCharacter(item.character.mal_id);
                            }, 50);
                          }}
                        >
                          <img
                            src={item.character.images?.jpg?.image_url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="flex flex-col min-w-0 pr-12 flex-grow">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {item.character.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{item.role} Character</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center col-span-2 py-8 italic">No characters archived.</p>
                    )}
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 animate-fade-in">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec) => {
                        const recManga = rec.entry;
                        return (
                          <div
                            key={recManga.mal_id}
                            className="group flex flex-col gap-2 cursor-pointer"
                            onClick={() => {
                              setDetails(null);
                              setCharacters([]);
                              setRecommendations([]);
                              setActiveTab('overview');
                              request(`/manga/${recManga.mal_id}/full`).then(res => {
                                if (res && res.data) setDetails(res.data);
                              });
                              request(`/manga/${recManga.mal_id}/characters`).then(res => {
                                if (res && res.data) setCharacters(res.data.slice(0, 8));
                              });
                              request(`/manga/${recManga.mal_id}/recommendations`).then(res => {
                                if (res && res.data) setRecommendations(res.data.slice(0, 6));
                              });
                            }}
                          >
                            <div className="relative overflow-hidden rounded-xl aspect-[3/4] border bg-muted">
                              <img
                                src={recManga.images?.jpg?.image_url}
                                alt=""
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <span className="font-semibold text-xs text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                              {recManga.title}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center col-span-6 py-8 italic">No recommendations available.</p>
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
