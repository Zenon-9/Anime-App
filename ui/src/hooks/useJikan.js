import { useState, useCallback, useRef } from 'react';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const GLOBAL_CACHE = new Map(); // Sharing cache across all component mounts

// Helper function to sleep (used for rate-limiting retry)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Core fetcher with cache and retry (up to 3 times)
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1500) {
  try {
    const response = await fetch(url, options);

    // Handle Jikan rate limit (429)
    if (response.status === 429) {
      if (retries > 0) {
        console.warn(`Jikan API rate limited (429). Retrying in ${delay}ms... (${retries} retries left)`);
        await sleep(delay);
        return fetchWithRetry(url, options, retries - 1, delay * 2); // Exponential backoff
      } else {
        throw new Error('Jikan API rate limit exceeded. Please try again in a moment.');
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText} (${response.status})`);
    }

    const json = await response.json();
    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw err;
  }
}

export function useJikan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const request = useCallback(async (endpoint, params = {}) => {
    // Construct Query String
    const cleanParams = Object.entries(params)
      .filter(([, val]) => val !== undefined && val !== null && val !== '')
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join('&');

    const url = `${JIKAN_BASE_URL}${endpoint}${cleanParams ? `?${cleanParams}` : ''}`;

    // Return cached data if available
    if (GLOBAL_CACHE.has(url)) {
      setError(null);
      return GLOBAL_CACHE.get(url);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await fetchWithRetry(url, { signal: abortControllerRef.current.signal });
      GLOBAL_CACHE.set(url, result);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(`Jikan API Error on ${endpoint}:`, err);
        setError(err.message || 'Something went wrong fetching data.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clean up on unmount
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    loading,
    error,
    request,
    cancel
  };
}

