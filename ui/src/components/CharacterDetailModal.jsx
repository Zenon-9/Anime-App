import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Play, Loader2, User, Film } from 'lucide-react';
import { useJikan } from '@/hooks/useJikan';
import { Button } from '@/components/ui/button';

export default function CharacterDetailModal({ characterId, onClose, onSelectAnime, onSelectManga }) {
  const [activeTab, setActiveTab] = useState('about');
  const [details, setDetails] = useState(null);

  const { loading, error, request } = useJikan();
  const dialogRef = useRef(null);

  const handleClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    onClose();
  }, [onClose]);

  // Fetch character details
  useEffect(() => {
    if (!characterId) return;

    // Reset details and active tab on character change
    Promise.resolve().then(() => {
      setDetails(null);
      setActiveTab('about');
    });

    async function fetchCharacterDetails() {
      const res = await request(`/characters/${characterId}/full`);
      if (res && res.data) {
        setDetails(res.data);
      }
    }

    fetchCharacterDetails();
  }, [characterId, request]);

  // Open modal using showModal()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && characterId) {
      if (!dialog.open) {
        dialog.showModal();
      }
    }
  }, [characterId]);

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
  }, [characterId, handleClose]);

  if (!characterId) return null;

  const characterImage = details?.images?.jpg?.image_url;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="char-dialog-title"
      onClose={handleClose}
      className="m-auto max-h-[85vh] w-[92%] max-w-[850px] rounded-3xl border bg-card text-card-foreground shadow-2xl overflow-y-auto animate-fade-in p-0 outline-none backdrop:backdrop-blur-md backdrop:bg-background/80 z-50"
    >
      {loading && !details ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-medium text-muted-foreground">Retrieving character logs...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 gap-4 text-center">
          <p className="text-destructive font-semibold">{error}</p>
          <Button onClick={handleClose}>Close Dialog</Button>
        </div>
      ) : details ? (
        <div className="flex flex-col">
          {/* Header Banner Background */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={characterImage}
              alt=""
              className="w-full h-full object-cover blur-[18px] brightness-[0.3] scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>

            <Button
              onClick={handleClose}
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 rounded-full w-9 h-9 bg-background/50 border-muted text-foreground cursor-pointer hover:rotate-90 transition-transform duration-300 z-50"
              aria-label="Close Character Modal"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Character Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] px-6 sm:px-10 pb-10 gap-8 -mt-20 relative z-10">
            {/* Left Column: Portrait & Metadata */}
            <div className="flex flex-col gap-4">
              <img
                src={characterImage}
                alt={details.name}
                className="w-full max-w-[220px] h-[300px] object-cover rounded-2xl border shadow-lg bg-muted mx-auto md:mx-0"
              />

              <div className="p-4 rounded-2xl border bg-muted/30 flex flex-col gap-2.5 text-xs text-muted-foreground">
                <div>
                  <span className="font-bold text-foreground block">Kanji Name</span>
                  <span>{details.name_kanji || 'N/A'}</span>
                </div>
                {details.nicknames && details.nicknames.length > 0 && (
                  <div>
                    <span className="font-bold text-foreground block">Nicknames</span>
                    <span className="line-clamp-2">{details.nicknames.join(', ')}</span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-foreground block">Favorites on MAL</span>
                  <span>{details.favorites?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Name & Details Content */}
            <div className="flex flex-col gap-5 mt-6 md:mt-24">
              <div>
                <h2 id="char-dialog-title" className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight font-heading">
                  {details.name}
                </h2>
                <span className="text-sm text-primary font-semibold mt-1 block">
                  Character ID: #{details.mal_id}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border/40 gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-px">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'about'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Biography
                </button>
                <button
                  onClick={() => setActiveTab('voices')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'voices'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Voice Actors ({details.voices?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('anime')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'anime'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Anime Roles ({details.anime?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('manga')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'manga'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  Manga Roles ({details.manga?.length || 0})
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[220px]">
                {activeTab === 'about' && (
                  <div className="animate-fade-in text-sm leading-relaxed text-muted-foreground whitespace-pre-line max-h-[350px] overflow-y-auto pr-1">
                    {details.about ? (
                      details.about
                    ) : (
                      <p className="italic text-center py-8">No biography files currently registered for this character.</p>
                    )}
                  </div>
                )}

                {activeTab === 'voices' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in max-h-[350px] overflow-y-auto pr-1">
                    {details.voices && details.voices.length > 0 ? (
                      details.voices.map((va, idx) => (
                        <div key={`${va.person.mal_id}-${idx}`} className="flex items-center gap-3 p-2 rounded-xl border bg-muted/10">
                          <img
                            src={va.person.images?.jpg?.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0"
                            loading="lazy"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-foreground truncate">{va.person.name}</span>
                            <span className="text-[10px] text-primary font-semibold mt-0.5">{va.language} Voice</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center col-span-2 py-8 italic">No voice actor credits archived.</p>
                    )}
                  </div>
                )}

                {activeTab === 'anime' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 animate-fade-in max-h-[350px] overflow-y-auto pr-1">
                    {details.anime && details.anime.length > 0 ? (
                      details.anime.map((role, idx) => {
                        const ani = role.anime;
                        return (
                          <div
                            key={`${ani.mal_id}-${idx}`}
                            className="group flex flex-col gap-2 p-2 rounded-xl border bg-muted/10 hover:bg-muted/20 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                            onClick={() => onSelectAnime(ani.mal_id)}
                          >
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4] border bg-muted">
                              <img
                                src={ani.images?.jpg?.image_url}
                                alt=""
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm border border-border/50 text-[9px] font-bold text-foreground tracking-wider uppercase">
                                {role.role}
                              </div>
                            </div>
                            <span className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight" title={ani.title}>
                              {ani.title}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center col-span-3 py-8 italic">No registered anime appearances.</p>
                    )}
                  </div>
                )}

                {activeTab === 'manga' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 animate-fade-in max-h-[350px] overflow-y-auto pr-1">
                    {details.manga && details.manga.length > 0 ? (
                      details.manga.map((role, idx) => {
                        const mng = role.manga;
                        return (
                          <div
                            key={`${mng.mal_id}-${idx}`}
                            className="group flex flex-col gap-2 p-2 rounded-xl border bg-muted/10 hover:bg-muted/20 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                            onClick={() => onSelectManga(mng.mal_id)}
                          >
                            <div className="relative overflow-hidden rounded-lg aspect-[3/4] border bg-muted">
                              <img
                                src={mng.images?.jpg?.image_url}
                                alt=""
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm border border-border/50 text-[9px] font-bold text-foreground tracking-wider uppercase">
                                {role.role}
                              </div>
                            </div>
                            <span className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight" title={mng.title}>
                              {mng.title}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center col-span-3 py-8 italic">No registered manga appearances.</p>
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
