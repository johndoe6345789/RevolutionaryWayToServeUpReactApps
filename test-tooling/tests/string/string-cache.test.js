const { StringCache } = require('../../../string/string-cache.js');

describe('StringCache', () => {
  let cache;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new StringCache();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const cache = new StringCache();

      expect(cache.config).toEqual({});
      expect(cache.cache).toBeInstanceOf(Map);
      expect(cache.maxSize).toBe(100);
      expect(cache.ttl).toBe(3600000); // 1 hour
    });

    it('should create instance with custom config', () => {
      const config = { maxSize: 50, ttl: 1800000 };
      const cache = new StringCache(config);

      expect(cache.maxSize).toBe(50);
      expect(cache.ttl).toBe(1800000);
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should return cached data for existing key', () => {
      const testData = { message: 'test' };
      cache.set('testKey', testData);

      expect(cache.get('testKey')).toEqual(testData);
    });

    it('should return null for expired entries', () => {
      const testData = { message: 'test' };
      cache.set('testKey', testData);

      // Advance time past TTL
      jest.advanceTimersByTime(3600001);

      expect(cache.get('testKey')).toBeNull();
      expect(cache.size()).toBe(0);
    });
  });

  describe('set', () => {
    it('should store data in cache', () => {
      const testData = { message: 'test' };
      cache.set('testKey', testData);

      expect(cache.get('testKey')).toEqual(testData);
      expect(cache.size()).toBe(1);
    });

    it('should evict oldest entry when max size reached', () => {
      const smallCache = new StringCache({ maxSize: 2 });

      smallCache.set('key1', 'data1');
      smallCache.set('key2', 'data2');
      smallCache.set('key3', 'data3');

      expect(smallCache.get('key1')).toBeNull(); // Should be evicted
      expect(smallCache.get('key2')).toEqual('data2');
      expect(smallCache.get('key3')).toEqual('data3');
      expect(smallCache.size()).toBe(2);
    });
  });

  describe('isExpired', () => {
    it('should return false for fresh entries', () => {
      cache.set('testKey', 'data');

      const entry = cache.cache.get('testKey');
      expect(cache.isExpired(entry)).toBe(false);
    });

    it('should return true for expired entries', () => {
      cache.set('testKey', 'data');

      jest.advanceTimersByTime(3600001);

      const entry = cache.cache.get('testKey');
      expect(cache.isExpired(entry)).toBe(true);
    });
  });

  describe('evictOldest', () => {
    it('should evict the oldest entry', () => {
      cache.set('key1', 'data1');
      jest.advanceTimersByTime(1000);
      cache.set('key2', 'data2');
      jest.advanceTimersByTime(1000);
      cache.set('key3', 'data3');

      cache.evictOldest();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toEqual('data2');
      expect(cache.get('key3')).toEqual('data3');
    });
  });

  describe('clear', () => {
    it('should clear all cached data', () => {
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');

      expect(cache.size()).toBe(2);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('size', () => {
    it('should return correct cache size', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'data1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'data2');
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });
});
