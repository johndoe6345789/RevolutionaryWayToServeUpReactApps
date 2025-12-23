/**
 * StringCache - Handles caching of parsed string data
 * Single responsibility: Cache string data for performance
 */
class StringCache {
  constructor(config = {}) {
    this.config = config;
    this.cache = new Map();
    this.maxSize = config.maxSize || 100;
    this.ttl = config.ttl || 3600000; // 1 hour default
  }

  /**
   * Get cached data by key
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Check if cache entry is expired
   * @param {Object} entry - Cache entry
   * @returns {boolean}
   */
  isExpired(entry) {
    return (Date.now() - entry.timestamp) > this.ttl;
  }

  /**
   * Evict oldest cache entry
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }
}

module.exports = { StringCache };
