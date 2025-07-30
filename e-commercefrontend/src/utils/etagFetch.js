// ETag utility for frontend caching
class ETagCache {
  constructor() {
    this.cache = new Map();
    this.storageKey = 'etag_cache';
    this.loadFromStorage();
  }

  // Load ETags from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load ETag cache from storage:', error);
    }
  }

  // Save ETags to localStorage
  saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save ETag cache to storage:', error);
    }
  }

  // Get ETag for a URL
  getETag(url) {
    return this.cache.get(url);
  }

  // Set ETag for a URL
  setETag(url, etag) {
    this.cache.set(url, etag);
    this.saveToStorage();
  }

  // Remove ETag for a URL
  removeETag(url) {
    this.cache.delete(url);
    this.saveToStorage();
  }

  // Clear all ETags
  clear() {
    this.cache.clear();
    localStorage.removeItem(this.storageKey);
  }

  // Get cache status for debugging
  getCacheInfo() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries())
    };
  }
}

// Enhanced fetch with ETag support
class ETagFetch {
  constructor() {
    this.etagCache = new ETagCache();
  }

  async fetch(url, options = {}) {
    const etag = this.etagCache.getETag(url);
    
    // Add If-None-Match header if we have an ETag
    const headers = {
      ...options.headers,
      ...(etag && { 'If-None-Match': etag })
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle 304 Not Modified
    if (response.status === 304) {
      console.log(`📦 Cache hit for ${url} - returning cached data`);
      return {
        ok: true,
        status: 304,
        fromCache: true,
        json: () => Promise.resolve(this.getCachedData(url)),
        headers: response.headers
      };
    }

    // Store new ETag if present
    const newETag = response.headers.get('ETag');
    if (newETag) {
      this.etagCache.setETag(url, newETag);
      console.log(`🏷️ Stored ETag for ${url}: ${newETag}`);
    }

    // Store response data for cache
    if (response.ok) {
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        this.setCachedData(url, data);
      } catch (error) {
        console.warn('Failed to cache response data:', error);
      }
    }

    return response;
  }

  // Cache response data in sessionStorage (for 304 responses)
  setCachedData(url, data) {
    try {
      const cacheKey = `cached_data_${btoa(url)}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache response data:', error);
    }
  }

  // Get cached response data
  getCachedData(url) {
    try {
      const cacheKey = `cached_data_${btoa(url)}`;
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  // Clear all cache
  clearCache() {
    this.etagCache.clear();
    // Clear sessionStorage cached data
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cached_data_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Get cache statistics
  getCacheStats() {
    return this.etagCache.getCacheInfo();
  }
}

// Create singleton instance
const etagFetch = new ETagFetch();

export default etagFetch;
export { ETagCache, ETagFetch };
