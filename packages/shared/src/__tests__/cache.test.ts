import { LRUCache, QueryCache, globalQueryCache } from '../utils/cache';
import { delay } from '../utils/testing';

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>({
      maxSize: 3,
      defaultTTL: 1000
    });
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBe(null);
  });

  it('should respect TTL', async () => {
    cache.set('key1', 'value1', 100);
    expect(cache.get('key1')).toBe('value1');

    await delay(150);
    expect(cache.get('key1')).toBe(null);
  });

  it('should evict LRU items when at capacity', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');

    // Access key1 to make it recently used
    cache.get('key1');

    // Add key4, should evict key2 (least recently used)
    cache.set('key4', 'value4');

    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe(null);
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should update existing keys', () => {
    cache.set('key1', 'value1');
    cache.set('key1', 'updated_value1');

    expect(cache.get('key1')).toBe('updated_value1');
    expect(cache.size()).toBe(1);
  });

  it('should clear all items', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    cache.clear();

    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBe(null);
    expect(cache.get('key2')).toBe(null);
  });

  it('should delete specific items', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    expect(cache.delete('key1')).toBe(true);
    expect(cache.delete('nonexistent')).toBe(false);

    expect(cache.get('key1')).toBe(null);
    expect(cache.get('key2')).toBe('value2');
  });

  it('should provide statistics', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    // Access key1 twice
    cache.get('key1');
    cache.get('key1');

    const stats = cache.getStats();

    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(3);
    expect(stats.entries).toHaveLength(2);

    const key1Stats = stats.entries.find(e => e.key === 'key1');
    expect(key1Stats?.hits).toBe(2);
  });

  it('should cleanup expired entries', async () => {
    cache.set('key1', 'value1', 50);
    cache.set('key2', 'value2', 200);

    await delay(100);
    cache.cleanup();

    expect(cache.get('key1')).toBe(null);
    expect(cache.get('key2')).toBe('value2');
  });
});

describe('QueryCache', () => {
  let queryCache: QueryCache;
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    queryCache = new QueryCache({ maxSize: 10, defaultTTL: 1000 });
    mockFetcher = jest.fn();
  });

  it('should fetch and cache data', async () => {
    mockFetcher.mockResolvedValue('test-data');

    const result = await queryCache.get('test-key', mockFetcher);

    expect(result).toBe('test-data');
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should return cached data on subsequent calls', async () => {
    mockFetcher.mockResolvedValue('test-data');

    await queryCache.get('test-key', mockFetcher);
    const result = await queryCache.get('test-key', mockFetcher);

    expect(result).toBe('test-data');
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should deduplicate concurrent requests', async () => {
    mockFetcher.mockResolvedValue('test-data');

    const promises = [
      queryCache.get('test-key', mockFetcher),
      queryCache.get('test-key', mockFetcher),
      queryCache.get('test-key', mockFetcher)
    ];

    const results = await Promise.all(promises);

    expect(results).toEqual(['test-data', 'test-data', 'test-data']);
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should invalidate cache entries', async () => {
    mockFetcher.mockResolvedValue('test-data');

    await queryCache.get('test-key', mockFetcher);
    queryCache.invalidate('test');

    await queryCache.get('test-key', mockFetcher);

    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('should invalidate cache entries by regex', async () => {
    mockFetcher.mockResolvedValue('test-data');

    await queryCache.get('user-123', mockFetcher);
    await queryCache.get('user-456', mockFetcher);
    await queryCache.get('post-789', mockFetcher);

    queryCache.invalidate(/^user-/);

    // These should fetch again
    await queryCache.get('user-123', mockFetcher);
    await queryCache.get('user-456', mockFetcher);

    // This should still be cached
    await queryCache.get('post-789', mockFetcher);

    expect(mockFetcher).toHaveBeenCalledTimes(5); // 3 initial + 2 refetch
  });

  it('should preload data', () => {
    queryCache.preload('test-key', 'preloaded-data');

    return queryCache.get('test-key', mockFetcher).then(result => {
      expect(result).toBe('preloaded-data');
      expect(mockFetcher).not.toHaveBeenCalled();
    });
  });

  it('should handle fetcher errors', async () => {
    const error = new Error('Fetch failed');
    mockFetcher.mockRejectedValue(error);

    await expect(queryCache.get('test-key', mockFetcher)).rejects.toThrow('Fetch failed');

    // Should not cache errors
    mockFetcher.mockResolvedValue('success');
    const result = await queryCache.get('test-key', mockFetcher);

    expect(result).toBe('success');
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });
});

describe('Global Query Cache', () => {
  beforeEach(() => {
    globalQueryCache.invalidate();
  });

  it('should be a singleton instance', () => {
    expect(globalQueryCache).toBeDefined();
    expect(globalQueryCache.getStats).toBeDefined();
  });

  it('should cache globally across imports', async () => {
    const mockFetcher = jest.fn().mockResolvedValue('global-data');

    const result1 = await globalQueryCache.get('global-key', mockFetcher);
    const result2 = await globalQueryCache.get('global-key', mockFetcher);

    expect(result1).toBe('global-data');
    expect(result2).toBe('global-data');
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });
});