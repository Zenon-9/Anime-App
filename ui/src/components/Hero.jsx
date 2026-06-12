import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles, Star, Award, Clock } from 'lucide-react';
import { useJikan } from '@/hooks/useJikan';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Hero({ onSelectAnime }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomLoading, setRandomLoading] = useState(false);
  const { loading, request } = useJikan();
  
  const autoPlayRef = useRef(null);

  // Fetch top anime for slides
  useEffect(() => {
    async function fetchTop() {
      const result = await request('/top/anime', { limit: 5 });
      if (result && result.data) {
        setSlides(result.data);
      }
    }
    fetchTop();
  }, [request]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  // Autoplay setup
  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
  }, [slides.length, stopAutoPlay]);

  useEffect(() => {
    if (slides.length > 0) {
      startAutoPlay();
    }
    return stopAutoPlay;
  }, [slides, currentIndex, startAutoPlay, stopAutoPlay]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSurprise = async () => {
    if (randomLoading) return;
    setRandomLoading(true);
    try {
      const result = await request('/random/anime');
      if (result && result.data) {
        onSelectAnime(result.data.mal_id);
      }
    } finally {
      setRandomLoading(false);
    }
  };

  if (loading && slides.length === 0) {
    return (
      <div className="relative h-[480px] mx-4 sm:mx-6 lg:mx-8 mb-8 rounded-3xl overflow-hidden glass-panel border flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 w-full px-12">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-20 w-2/3 rounded-lg" />
          <div className="flex gap-4 w-full justify-center">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentAnime = slides[currentIndex];
  const coverImage = currentAnime.images?.jpg?.large_image_url || currentAnime.images?.jpg?.image_url;

  return (
    <section 
      className="relative h-[520px] sm:h-[480px] mx-4 sm:mx-6 lg:mx-8 mb-8 rounded-3xl overflow-hidden border glass-panel glow-purple group/hero animate-fade-in"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        <img 
          src={coverImage} 
          alt="" 
          className="w-full h-full object-cover blur-[25px] brightness-[0.25] saturate-[1.4] scale-110 transition-all duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent"></div>
      </div>

      {/* Hero Content Grid */}
      <div className="relative h-full z-10 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] items-center px-6 sm:px-12 md:px-16 gap-8">
        <div className="flex flex-col items-start text-left animate-fade-in-up">
          
          <div className="flex flex-wrap gap-2 mb-4">
            {currentAnime.score && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase">
                <Star size={12} fill="currentColor" className="text-[#fbbf24]" />
                <span>★ {currentAnime.score.toFixed(1)}</span>
              </span>
            )}
            {currentAnime.rank && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/15 text-foreground border border-border/50 text-xs font-semibold">
                <Award size={12} />
                <span>Rank #{currentAnime.rank}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/65 text-muted-foreground border border-border/30 text-xs font-semibold">
              <Clock size={12} />
              <span>{currentAnime.type || 'TV'}</span>
            </span>
            {currentAnime.studios?.[0]?.name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/65 text-muted-foreground border border-border/30 text-xs font-semibold">
                <span>{currentAnime.studios[0].name}</span>
              </span>
            )}
            {currentAnime.season && currentAnime.year && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/65 text-muted-foreground border border-border/30 text-xs font-semibold">
                <span className="capitalize">{currentAnime.season} {currentAnime.year}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-4 line-clamp-2 font-heading drop-shadow-md">
            {currentAnime.title}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl leading-relaxed line-clamp-3">
            {currentAnime.synopsis || 'No synopsis available.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => onSelectAnime(currentAnime.mal_id)}
              className="font-semibold px-6 shadow-md hover:shadow-primary/20"
            >
              <Play size={16} fill="currentColor" className="mr-1.5" />
              <span>View Details</span>
            </Button>
            
            <Button 
              onClick={handleSurprise} 
              variant="outline"
              disabled={randomLoading}
              className="glass-panel border-muted hover:bg-accent text-foreground font-semibold px-6"
            >
              <Sparkles size={16} className={`mr-1.5 ${randomLoading ? 'animate-spin' : ''}`} />
              <span>{randomLoading ? 'Seeking...' : 'Surprise Me'}</span>
            </Button>
          </div>
        </div>

        {/* Floating Poster Graphic */}
        <div 
          className="hidden md:flex justify-end cursor-pointer"
          onClick={() => onSelectAnime(currentAnime.mal_id)}
        >
          <img 
            src={coverImage} 
            alt={currentAnime.title} 
            className="w-56 h-[320px] object-cover rounded-2xl border shadow-2xl hover:scale-105 hover:rotate-[2deg] transition-all duration-500" 
          />
        </div>
      </div>

      {/* Slider Controls */}
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/50 border-muted opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 z-20 cursor-pointer"
        onClick={handlePrev}
        aria-label="Previous Slide"
      >
        <ChevronLeft size={18} />
      </Button>

      <Button 
        variant="outline" 
        size="icon" 
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/50 border-muted opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 z-20 cursor-pointer"
        onClick={handleNext}
        aria-label="Next Slide"
      >
        <ChevronRight size={18} />
      </Button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 left-6 sm:left-12 flex gap-1.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
