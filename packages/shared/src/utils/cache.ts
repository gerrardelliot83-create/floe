export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  hits: number;
}

export interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  onEvict?: (key: string, entry: CacheEntry<any>) => void;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private maxSize: number;
  private defaultTTL: number;
  private onEvict?: (key: string, entry: CacheEntry<T>) => void;
  private accessCounter = 0;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.onEvict = options.onEvict;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
    }

    entry.hits++;
    this.accessOrder.set(key, this.accessCounter++);

    return entry.data;
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiry = now + (ttl || this.defaultTTL);

    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.data = value;
      entry.timestamp = now;
      entry.expiry = expiry;
      this.accessOrder.set(key, this.accessCounter++);
      return;
    }

    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      expiry,
      hits: 0
    };

    this.cache.set(key, entry);
    this.accessOrder.set(key, this.accessCounter++);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiry) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);

    if (entry && this.onEvict) {
      this.onEvict(key, entry);
    }

    this.accessOrder.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.onEvict(key, entry);
      }
    }

    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.data);
  }

  entries(): [string, T][] {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.data]);
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: now - entry.timestamp
    }));

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalAccesses = this.accessCounter;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
      entries: entries.sort((a, b) => b.hits - a.hits)
    };
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruAccessTime = Infinity;

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < lruAccessTime) {
        lruAccessTime = accessTime;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }
  }
}

export class QueryCache {
  private cache = new LRUCache<any>();
  private requestsInFlight = new Map<string, Promise<any>>();

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache(options);

    setInterval(() => {
      this.cache.cleanup();
    }, 60000); // Cleanup every minute
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const inFlight = this.requestsInFlight.get(key);
    if (inFlight) {
      return inFlight;
    }

    const promise = fetcher().then(result => {
      this.cache.set(key, result, ttl);
      this.requestsInFlight.delete(key);
      return result;
    }).catch(error => {
      this.requestsInFlight.delete(key);
      throw error;
    });

    this.requestsInFlight.set(key, promise);
    return promise;
  }

  invalidate(keyPattern?: string | RegExp): void {
    if (!keyPattern) {
      this.cache.clear();
      this.requestsInFlight.clear();
      return;
    }

    const keys = this.cache.keys();
    const keysToDelete: string[] = [];

    for (const key of keys) {
      if (typeof keyPattern === 'string') {
        if (key.includes(keyPattern)) {
          keysToDelete.push(key);
        }
      } else {
        if (keyPattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.requestsInFlight.delete(key);
    }
  }

  preload<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, ttl);
  }

  getStats() {
    return this.cache.getStats();
  }
}

export class ImageCache {
  private cache = new LRUCache<string>();

  constructor(maxSize: number = 50) {
    this.cache = new LRUCache({
      maxSize,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      onEvict: (key, entry) => {
        if (entry.data.startsWith('blob:')) {
          URL.revokeObjectURL(entry.data);
        }
      }
    });
  }

  async get(url: string, transformer?: (blob: Blob) => Promise<string>): Promise<string> {
    const cached = this.cache.get(url);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();

      let processedUrl: string;
      if (transformer) {
        processedUrl = await transformer(blob);
      } else {
        processedUrl = URL.createObjectURL(blob);
      }

      this.cache.set(url, processedUrl);
      return processedUrl;

    } catch (error) {
      console.error('Image cache fetch failed:', error);
      throw error;
    }
  }

  preload(url: string): Promise<void> {
    return this.get(url).then(() => {});
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return this.cache.getStats();
  }
}

const globalQueryCache = new QueryCache({
  maxSize: 200,
  defaultTTL: 5 * 60 * 1000
});

const globalImageCache = new ImageCache(50);

export { globalQueryCache, globalImageCache };