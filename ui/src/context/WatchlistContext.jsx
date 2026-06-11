/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist based on logged-in user
  useEffect(() => {
    try {
      const key = user ? `aniverse_watchlist_${user.username.toLowerCase()}` : 'aniverse_watchlist_guest';
      const saved = localStorage.getItem(key);
      Promise.resolve().then(() => {
        setWatchlist(saved ? JSON.parse(saved) : []);
      });
    } catch (e) {
      console.error('Failed to parse watchlist from localStorage', e);
      Promise.resolve().then(() => {
        setWatchlist([]);
      });
    }
  }, [user]);

  // Sync to localStorage
  useEffect(() => {
    const key = user ? `aniverse_watchlist_${user.username.toLowerCase()}` : 'aniverse_watchlist_guest';
    localStorage.setItem(key, JSON.stringify(watchlist));
  }, [watchlist, user]);

  const addToWatchlist = (anime, status = 'Plan to Watch') => {
    setWatchlist((prev) => {
      // Check if already in list
      if (prev.some((item) => item.mal_id === anime.mal_id)) {
        return prev;
      }

      const genres = anime.genres ? anime.genres.map(g => g.name) : [];
      const newItem = {
        mal_id: anime.mal_id,
        title: anime.title || anime.title_english || anime.title_japanese,
        image_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        type: anime.type || 'TV',
        episodes: anime.episodes || 0,
        ep_duration: anime.duration ? parseDuration(anime.duration) : 24, // fallback to 24m
        status,
        user_score: 0, // 0 means unrated
        progress: 0,
        genres,
        added_at: Date.now()
      };

      return [newItem, ...prev];
    });
  };

  const updateWatchlistItem = (mal_id, updates) => {
    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.mal_id === mal_id) {
          const updatedItem = { ...item, ...updates };
          // Bound progress to total episodes if total episodes is set
          if (updatedItem.episodes > 0 && updatedItem.progress > updatedItem.episodes) {
            updatedItem.progress = updatedItem.episodes;
          }
          // Automatically mark completed if progress equals total episodes
          if (updatedItem.episodes > 0 && updatedItem.progress === updatedItem.episodes) {
            updatedItem.status = 'Completed';
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeFromWatchlist = (mal_id) => {
    setWatchlist((prev) => prev.filter((item) => item.mal_id !== mal_id));
  };

  const getWatchlistItem = (mal_id) => {
    return watchlist.find((item) => item.mal_id === mal_id);
  };

  // Helper to parse duration string (e.g. "24 min", "1 hr 45 min") to total minutes
  function parseDuration(durationStr) {
    if (!durationStr) return 24;
    const hoursMatch = durationStr.match(/(\d+)\s*hr/);
    const minsMatch = durationStr.match(/(\d+)\s*min/);
    
    let totalMinutes = 0;
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    }
    if (minsMatch) {
      totalMinutes += parseInt(minsMatch[1], 10);
    }
    
    return totalMinutes > 0 ? totalMinutes : 24;
  }

  // Calculate statistics (memoized)
  const stats = useMemo(() => {
    const totalAnimes = watchlist.length;
    
    let watchingCount = 0;
    let planToWatchCount = 0;
    let completedCount = 0;
    let droppedCount = 0;
    let totalEpisodes = 0;
    let totalTime = 0;
    let ratedCount = 0;
    let sumScore = 0;
    
    const genreMap = {};

    watchlist.forEach((item) => {
      // Status counts
      if (item.status === 'Watching') watchingCount++;
      else if (item.status === 'Plan to Watch') planToWatchCount++;
      else if (item.status === 'Completed') completedCount++;
      else if (item.status === 'Dropped') droppedCount++;

      // Episode counts & Time
      totalEpisodes += item.progress;
      totalTime += item.progress * (item.ep_duration || 24);

      // Score
      if (item.user_score > 0) {
        ratedCount++;
        sumScore += item.user_score;
      }

      // Genre counts
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach((genre) => {
          genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
      }
    });

    const avgScore = ratedCount > 0 ? (sumScore / ratedCount).toFixed(1) : '0.0';

    // Sort genres by popularity
    const genreDistribution = Object.entries(genreMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAnimes,
      watchingCount,
      planToWatchCount,
      completedCount,
      droppedCount,
      totalEpisodes,
      totalTime,
      avgScore,
      genreDistribution
    };
  }, [watchlist]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        updateWatchlistItem,
        removeFromWatchlist,
        getWatchlistItem,
        stats
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
