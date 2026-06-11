import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useJikan } from '@/hooks/useJikan';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Library, PieChart, Star, Compass, UserPlus, ShieldCheck, Heart } from 'lucide-react';

export default function LandingPage({ setCurrentPage, onSelectAnime }) {
  const [trends, setTrends] = useState([]);
  const { loading, request } = useJikan();
  const { user } = useAuth();

  useEffect(() => {
    async function getLandingTrends() {
      const result = await request('/seasons/now', { limit: 4 });
      if (result && result.data) {
        setTrends(result.data);
      }
    }
    getLandingTrends();
  }, [request]);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in pb-12">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden py-20 px-6 sm:px-12 lg:px-24 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 text-xs font-semibold text-primary mb-6 animate-pulse">
          <Sparkles size={14} />
          <span>No Ads. No Subscriptions. Just Anime.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6 font-heading">
          Your Portal Into the <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Anime Universe
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Discover seasonal trends, read full archives, view trailer previews, check character voice actor cast files, and track your watchlist with automatic analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            size="lg" 
            variant="default"
            className="w-full sm:w-auto text-base font-semibold px-8 h-12 shadow-lg hover:shadow-primary/20"
            onClick={() => setCurrentPage('home')}
          >
            <Compass className="mr-2" size={18} />
            <span>Discover Catalog</span>
          </Button>

          {!user ? (
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto text-base font-semibold px-8 h-12 glass-panel"
              onClick={() => setCurrentPage('signup')}
            >
              <UserPlus className="mr-2" size={18} />
              <span>Join Aniverse</span>
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto text-base font-semibold px-8 h-12 glass-panel"
              onClick={() => setCurrentPage('watchlist')}
            >
              <Heart className="mr-2 text-rose-500 fill-rose-500" size={18} />
              <span>My List</span>
            </Button>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="px-6 sm:px-12 lg:px-24 max-w-6xl mx-auto w-full mb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 font-heading">
          Everything You Need to Track Your Shows
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-panel border-muted hover:border-primary/50 transition-all duration-300">
            <CardContent className="pt-6 flex flex-col items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Library size={24} />
              </div>
              <h3 className="text-lg font-bold">20,000+ Databases</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Powered by the Jikan API, browse complete MAL records including reviews, characters, staff, recommendations, and trailers.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-muted hover:border-primary/50 transition-all duration-300">
            <CardContent className="pt-6 flex flex-col items-start gap-4">
              <div className="p-3 rounded-lg bg-secondary/10 text-secondary">
                <PieChart size={24} />
              </div>
              <h3 className="text-lg font-bold">Watch Time Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log watched episodes and user ratings. Watch statistics calculate days spent watching, average score, and favorite genres automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-muted hover:border-primary/50 transition-all duration-300">
            <CardContent className="pt-6 flex flex-col items-start gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold">Privacy Guaranteed</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No tracking. Your accounts, credentials, and watchlist data are securely synced completely local to your browser database.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seasonal Trends Grid (With Skeleton Loaders) */}
      <section className="px-6 sm:px-12 lg:px-24 max-w-6xl mx-auto w-full mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold font-heading">Airing Now</h2>
          <Button variant="link" className="text-primary font-semibold" onClick={() => setCurrentPage('home')}>
            View All
          </Button>
        </div>

        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-[260px] w-full rounded-xl" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {trends.map((anime) => (
              <div 
                key={anime.mal_id} 
                onClick={() => onSelectAnime(anime.mal_id)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] border bg-muted">
                  <img 
                    src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} 
                    alt={anime.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {anime.score && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/50 flex items-center gap-1 text-[#fbbf24] text-xs font-bold shadow-sm">
                      <Star size={12} fill="currentColor" />
                      <span>{anime.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors text-card-foreground">
                    {anime.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-1">
                    {anime.type || 'TV'} • {anime.episodes || '?'} ep
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
