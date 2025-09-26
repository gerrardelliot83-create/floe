export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T {
  let timeout: NodeJS.Timeout | null = null;
  let result: ReturnType<T>;

  const debounced = function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) result = func.apply(this, args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) result = func.apply(this, args);

    return result;
  } as T;

  return debounced;
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;
  let result: ReturnType<T>;

  const { leading = true, trailing = true } = options;

  const throttled = function(this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (!previous && !leading) previous = now;

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(this, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now();
        timeout = null;
        result = func.apply(this, args);
      }, remaining);
    }

    return result;
  } as T;

  return throttled;
}

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T & { cache: Map<string, ReturnType<T>>; clear: () => void } {
  const cache = new Map<string, ReturnType<T>>();

  const memoized = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func.apply(this, args);
    cache.set(key, result);

    return result;
  } as T & { cache: Map<string, ReturnType<T>>; clear: () => void };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();

  return memoized;
}

export function batchRequests<T, R>(
  batchProcessor: (items: T[]) => Promise<R[]>,
  options: {
    maxBatchSize?: number;
    batchTimeout?: number;
    maxConcurrency?: number;
  } = {}
): (item: T) => Promise<R> {
  const {
    maxBatchSize = 10,
    batchTimeout = 50,
    maxConcurrency = 3
  } = options;

  let batch: { item: T; resolve: (value: R) => void; reject: (error: Error) => void }[] = [];
  let batchTimer: NodeJS.Timeout | null = null;
  let activeBatches = 0;
  let queue: typeof batch = [];

  const processBatch = async (currentBatch: typeof batch) => {
    if (currentBatch.length === 0) return;

    activeBatches++;

    try {
      const items = currentBatch.map(({ item }) => item);
      const results = await batchProcessor(items);

      currentBatch.forEach(({ resolve }, index) => {
        resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(({ reject }) => {
        reject(error instanceof Error ? error : new Error('Batch processing failed'));
      });
    } finally {
      activeBatches--;
      processQueue();
    }
  };

  const processQueue = () => {
    if (activeBatches >= maxConcurrency || queue.length === 0) {
      return;
    }

    const currentBatch = queue.splice(0, maxBatchSize);
    processBatch(currentBatch);
  };

  const flushBatch = () => {
    if (batch.length === 0) return;

    if (activeBatches < maxConcurrency) {
      processBatch([...batch]);
    } else {
      queue.push(...batch);
    }

    batch = [];

    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
  };

  return (item: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      batch.push({ item, resolve, reject });

      if (batch.length >= maxBatchSize) {
        flushBatch();
      } else if (!batchTimer) {
        batchTimer = setTimeout(flushBatch, batchTimeout);
      }
    });
  };
}

export class PerformanceMonitor {
  private metrics = new Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    lastTime: number;
  }>();

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.finally(() => {
          this.recordMetric(name, performance.now() - start);
        }) as unknown as T;
      }

      this.recordMetric(name, performance.now() - start);
      return result;
    } catch (error) {
      this.recordMetric(name, performance.now() - start);
      throw error;
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      this.recordMetric(name, performance.now() - start);
      return result;
    } catch (error) {
      this.recordMetric(name, performance.now() - start);
      throw error;
    }
  }

  private recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.lastTime = duration;
    } else {
      this.metrics.set(name, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
        lastTime: duration
      });
    }
  }

  getMetrics(name?: string) {
    if (name) {
      const metric = this.metrics.get(name);
      if (!metric) return null;

      return {
        name,
        count: metric.count,
        averageTime: metric.totalTime / metric.count,
        minTime: metric.minTime,
        maxTime: metric.maxTime,
        lastTime: metric.lastTime,
        totalTime: metric.totalTime
      };
    }

    return Array.from(this.metrics.entries()).map(([name, metric]) => ({
      name,
      count: metric.count,
      averageTime: metric.totalTime / metric.count,
      minTime: metric.minTime,
      maxTime: metric.maxTime,
      lastTime: metric.lastTime,
      totalTime: metric.totalTime
    })).sort((a, b) => b.totalTime - a.totalTime);
  }

  clear(): void {
    this.metrics.clear();
  }

  reset(name: string): void {
    this.metrics.delete(name);
  }
}

// Note: React-specific lazy loading moved to UI package to avoid React dependency in shared utils

export class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private preloadPromises = new Map<string, Promise<void>>();

  async preloadImage(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return;
    }

    const existingPromise = this.preloadPromises.get(src);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        this.preloadPromises.delete(src);
        resolve();
      };
      img.onerror = () => {
        this.preloadPromises.delete(src);
        reject(new Error(`Failed to preload image: ${src}`));
      };
      img.src = src;
    });

    this.preloadPromises.set(src, promise);
    return promise;
  }

  async preloadScript(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return;
    }

    const existingPromise = this.preloadPromises.get(src);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        this.preloadedResources.add(src);
        this.preloadPromises.delete(src);
        resolve();
      };
      script.onerror = () => {
        this.preloadPromises.delete(src);
        reject(new Error(`Failed to preload script: ${src}`));
      };
      document.head.appendChild(script);
    });

    this.preloadPromises.set(src, promise);
    return promise;
  }

  async preloadFont(family: string, url?: string): Promise<void> {
    const key = url || family;

    if (this.preloadedResources.has(key)) {
      return;
    }

    const existingPromise = this.preloadPromises.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = new Promise<void>((resolve, reject) => {
      if ('fonts' in document) {
        const font = new FontFace(family, url ? `url(${url})` : '');
        font.load().then(() => {
          (document.fonts as any).add(font);
          this.preloadedResources.add(key);
          this.preloadPromises.delete(key);
          resolve();
        }).catch((error) => {
          this.preloadPromises.delete(key);
          reject(error);
        });
      } else {
        resolve();
      }
    });

    this.preloadPromises.set(key, promise);
    return promise;
  }

  isPreloaded(resource: string): boolean {
    return this.preloadedResources.has(resource);
  }

  clear(): void {
    this.preloadedResources.clear();
    this.preloadPromises.clear();
  }
}

const globalPerformanceMonitor = new PerformanceMonitor();
const globalResourcePreloader = new ResourcePreloader();

export { globalPerformanceMonitor, globalResourcePreloader };