import { useState } from 'react';
import { AlertCircle, Compass, Plus, Minus, Trash2 } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function WatchlistDashboard({ onSelectAnime, setCurrentPage }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const { watchlist, updateWatchlistItem, removeFromWatchlist, stats } = useWatchlist();

  // Filter list
  const filteredList = watchlist.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.status === activeFilter;
  });

  // Helper to format watch time
  const formatWatchTime = (minutes) => {
    const mins = minutes % 60;
    const totalHours = Math.floor(minutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
    
    return parts.join(' ');
  };

  const handleProgressChange = (item, diff) => {
    const nextProgress = Math.max(0, item.progress + diff);
    // Limit progress if episodes count is known
    if (item.episodes > 0 && nextProgress > item.episodes) return;
    
    const updates = { progress: nextProgress };
    
    // Automatically set status to Completed if we watched all eps
    if (item.episodes > 0 && nextProgress === item.episodes) {
      updates.status = 'Completed';
    } else if (item.status === 'Completed' && nextProgress < item.episodes) {
      // Revert from Completed to Watching if we decrease progress
      updates.status = 'Watching';
    }
    
    updateWatchlistItem(item.mal_id, updates);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 gap-10 max-w-7xl mx-auto w-full animate-fade-in">
      
      {/* 1. Statistics Panel */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">Library Analytics</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Shows</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2 font-heading">{stats.totalAnimes}</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Time Tracked</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2 font-heading">{formatWatchTime(stats.totalTime)}</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#fbbf24]"></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Mean Score</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#fbbf24] mt-2 font-heading">★ {stats.avgScore}</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Eps Watched</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2 font-heading">{stats.totalEpisodes}</span>
          </div>
        </div>

        {/* Genre Distribution Graph */}
        {stats.genreDistribution.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border flex flex-col gap-4">
            <h4 className="text-sm font-bold text-foreground">Favorite Genres</h4>
            <div className="flex flex-col gap-3">
              {stats.genreDistribution.slice(0, 5).map((genre) => {
                const percentage = Math.min(100, (genre.count / stats.totalAnimes) * 100);
                return (
                  <div key={genre.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground">{genre.name}</span>
                      <span className="text-muted-foreground">{genre.count} titles</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Lists Panel */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">My Library</h2>

          {/* List Status Tabs */}
          <div className="flex p-1 rounded-xl bg-muted/50 border gap-1">
            {['All', 'Watching', 'Plan to Watch', 'Completed', 'Dropped'].map((filter) => (
              <Button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                variant={activeFilter === filter ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeFilter === filter ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="glass-panel border rounded-2xl flex flex-col items-center justify-center text-center p-12 py-16">
            <AlertCircle size={40} className="text-muted-foreground/40 mb-3" />
            <h3 className="font-bold text-foreground mb-1">List is Empty</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
              No entries logged under "{activeFilter}" yet. Find something to watch.
            </p>
            <Button onClick={() => setCurrentPage('home')} className="font-semibold px-6">
              <Compass className="mr-1.5" size={16} />
              <span>Browse Anime</span>
            </Button>
          </div>
        ) : (
          <div className="glass-panel border rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-5 py-4 font-semibold text-foreground">Anime Title</th>
                    <th className="px-5 py-4 font-semibold text-foreground hidden sm:table-cell">Format</th>
                    <th className="px-5 py-4 font-semibold text-foreground">Progress</th>
                    <th className="px-5 py-4 font-semibold text-foreground">Score</th>
                    <th className="px-5 py-4 font-semibold text-foreground">Status</th>
                    <th className="px-5 py-4 font-semibold text-foreground text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredList.map((item) => (
                    <tr key={item.mal_id} className="hover:bg-accent/10 transition-colors">
                      {/* Cover & Title */}
                      <td 
                        onClick={() => onSelectAnime(item.mal_id)} 
                        className="px-5 py-4 cursor-pointer max-w-[280px]"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image_url} 
                            alt="" 
                            className="w-10 h-14 object-cover rounded-md border bg-muted flex-shrink-0" 
                          />
                          <span className="font-bold text-foreground line-clamp-2 leading-tight hover:text-primary transition-colors" title={item.title}>
                            {item.title}
                          </span>
                        </div>
                      </td>

                      {/* Format */}
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-semibold uppercase border">
                          {item.type}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Button 
                            onClick={() => handleProgressChange(item, -1)}
                            variant="outline"
                            size="icon"
                            className="w-7 h-7 rounded-md cursor-pointer disabled:opacity-40"
                            disabled={item.progress <= 0}
                          >
                            <Minus size={12} />
                          </Button>
                          
                          <span className="font-semibold text-foreground text-center min-w-[50px]">
                            {item.progress} / {item.episodes || '?'}
                          </span>
                          
                          <Button 
                            onClick={() => handleProgressChange(item, 1)}
                            variant="outline"
                            size="icon"
                            className="w-7 h-7 rounded-md cursor-pointer disabled:opacity-40"
                            disabled={item.episodes > 0 && item.progress >= item.episodes}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </td>

                      {/* User score */}
                      <td className="px-5 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1.5 cursor-pointer bg-background/50 border-muted text-[#fbbf24]"
                            >
                              <span>{item.user_score > 0 ? `★ ${item.user_score}` : 'Unrated'}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-56 overflow-y-auto w-28">
                            <DropdownMenuItem 
                              onClick={() => updateWatchlistItem(item.mal_id, { user_score: 0 })}
                              className={item.user_score === 0 ? "bg-accent text-accent-foreground font-bold" : ""}
                            >
                              Unrated
                            </DropdownMenuItem>
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                              <DropdownMenuItem 
                                key={num} 
                                onClick={() => updateWatchlistItem(item.mal_id, { user_score: num })}
                                className={item.user_score === num ? "bg-primary/10 text-primary font-bold" : "text-[#fbbf24]"}
                              >
                                ★ {num}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer bg-background/50 border-muted text-foreground"
                            >
                              <span>{item.status}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-32">
                            {['Watching', 'Plan to Watch', 'Completed', 'Dropped'].map((status) => (
                              <DropdownMenuItem 
                                key={status} 
                                onClick={() => updateWatchlistItem(item.mal_id, { status })}
                                className={item.status === status ? "bg-primary/10 text-primary font-bold" : ""}
                              >
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>

                      {/* Delete */}
                      <td className="px-5 py-4 text-center">
                        <Button 
                          onClick={() => removeFromWatchlist(item.mal_id)}
                          variant="ghost" 
                          size="icon"
                          className="w-8 h-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                          title="Remove from Library"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
