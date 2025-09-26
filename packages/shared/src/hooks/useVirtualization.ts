import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

export interface VirtualizationOptions {
  itemCount: number;
  getItemSize: (index: number) => number;
  estimateItemSize?: number;
  overscan?: number;
  scrollMargin?: number;
  getScrollElement?: () => HTMLElement | null;
}

export interface VirtualizationResult {
  virtualItems: VirtualItem[];
  totalSize: number;
  startIndex: number;
  endIndex: number;
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end'; smooth?: boolean }) => void;
  scrollToOffset: (offset: number, options?: { smooth?: boolean }) => void;
}

export function useVirtualization(options: VirtualizationOptions): VirtualizationResult {
  const {
    itemCount,
    getItemSize,
    estimateItemSize = 50,
    overscan = 5,
    scrollMargin = 0,
    getScrollElement
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);

  const measurementsCache = useRef(new Map<number, number>());

  const getMeasuredItemSize = useCallback((index: number): number => {
    const cached = measurementsCache.current.get(index);
    if (cached !== undefined) {
      return cached;
    }

    const size = getItemSize(index);
    measurementsCache.current.set(index, size);
    return size;
  }, [getItemSize]);

  const totalSize = useMemo(() => {
    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      total += getMeasuredItemSize(i);
    }
    return total;
  }, [itemCount, getMeasuredItemSize]);

  const getItemOffset = useCallback((index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getMeasuredItemSize(i);
    }
    return offset;
  }, [getMeasuredItemSize]);

  const findItemIndexByOffset = useCallback((offset: number): number => {
    let start = 0;
    let end = itemCount - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const midOffset = getItemOffset(mid);
      const midSize = getMeasuredItemSize(mid);

      if (offset >= midOffset && offset < midOffset + midSize) {
        return mid;
      }

      if (offset < midOffset) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }

    return Math.min(start, itemCount - 1);
  }, [itemCount, getItemOffset, getMeasuredItemSize]);

  const getVisibleRange = useCallback((
    scrollTop: number,
    viewportHeight: number
  ): [number, number] => {
    if (itemCount === 0) {
      return [0, 0];
    }

    const startIndex = findItemIndexByOffset(Math.max(0, scrollTop - scrollMargin));
    const endOffset = scrollTop + viewportHeight + scrollMargin;

    let endIndex = startIndex;
    let currentOffset = getItemOffset(startIndex);

    while (endIndex < itemCount - 1 && currentOffset < endOffset) {
      currentOffset += getMeasuredItemSize(endIndex);
      endIndex++;
    }

    return [
      Math.max(0, startIndex - overscan),
      Math.min(itemCount - 1, endIndex + overscan)
    ];
  }, [itemCount, findItemIndexByOffset, scrollMargin, overscan, getItemOffset, getMeasuredItemSize]);

  const [startIndex, endIndex] = useMemo(() => {
    return getVisibleRange(scrollTop, scrollHeight);
  }, [scrollTop, scrollHeight, getVisibleRange]);

  const virtualItems = useMemo((): VirtualItem[] => {
    const items: VirtualItem[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const start = getItemOffset(i);
      const size = getMeasuredItemSize(i);

      items.push({
        index: i,
        start,
        size,
        end: start + size
      });
    }

    return items;
  }, [startIndex, endIndex, getItemOffset, getMeasuredItemSize]);

  const scrollToIndex = useCallback((
    index: number,
    options: { align?: 'start' | 'center' | 'end'; smooth?: boolean } = {}
  ) => {
    const element = scrollElementRef.current || getScrollElement?.();
    if (!element) return;

    const { align = 'start', smooth = true } = options;
    const itemOffset = getItemOffset(index);
    const itemSize = getMeasuredItemSize(index);
    const viewportHeight = element.clientHeight;

    let targetScrollTop: number;

    switch (align) {
      case 'start':
        targetScrollTop = itemOffset;
        break;
      case 'center':
        targetScrollTop = itemOffset + itemSize / 2 - viewportHeight / 2;
        break;
      case 'end':
        targetScrollTop = itemOffset + itemSize - viewportHeight;
        break;
    }

    targetScrollTop = Math.max(0, Math.min(targetScrollTop, totalSize - viewportHeight));

    element.scrollTo({
      top: targetScrollTop,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [getScrollElement, getItemOffset, getMeasuredItemSize, totalSize]);

  const scrollToOffset = useCallback((
    offset: number,
    options: { smooth?: boolean } = {}
  ) => {
    const element = scrollElementRef.current || getScrollElement?.();
    if (!element) return;

    const { smooth = true } = options;

    element.scrollTo({
      top: Math.max(0, Math.min(offset, totalSize - element.clientHeight)),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [getScrollElement, totalSize]);

  useEffect(() => {
    const element = getScrollElement?.() || scrollElementRef.current;
    if (!element) return;

    const updateScrollState = () => {
      setScrollTop(element.scrollTop);
      setScrollHeight(element.clientHeight);
    };

    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    const handleResize = () => {
      updateScrollState();
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    element.addEventListener('resize', handleResize);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('resize', handleResize);
    };
  }, [getScrollElement]);

  useEffect(() => {
    measurementsCache.current.clear();
  }, [getItemSize]);

  return {
    virtualItems,
    totalSize,
    startIndex,
    endIndex,
    scrollToIndex,
    scrollToOffset
  };
}

export interface InfiniteQueryOptions<T> {
  queryFn: (page: number, pageSize: number) => Promise<T[]>;
  pageSize?: number;
  threshold?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

export interface InfiniteQueryResult<T> {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInfiniteQuery<T>(options: InfiniteQueryOptions<T>): InfiniteQueryResult<T> {
  const {
    queryFn,
    pageSize = 20,
    threshold = 5,
    enabled = true,
    refetchOnWindowFocus = false
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchPage = useCallback(async (page: number, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetchingNextPage(true);
    }

    setError(null);

    try {
      const newData = await queryFn(page, pageSize);

      setData(prev => page === 0 ? newData : [...prev, ...newData]);
      setHasNextPage(newData.length === pageSize);

      if (newData.length > 0) {
        setCurrentPage(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [queryFn, pageSize]);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage) {
      return;
    }

    await fetchPage(currentPage + 1);
  }, [fetchPage, currentPage, isFetchingNextPage, hasNextPage]);

  const refetch = useCallback(async () => {
    setCurrentPage(0);
    await fetchPage(0, true);
  }, [fetchPage]);

  useEffect(() => {
    if (enabled) {
      fetchPage(0, true);
    }
  }, [enabled, fetchPage]);

  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [refetchOnWindowFocus, refetch]);

  return {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    refetch
  };
}

export function useIntersectionObserver(
  targetRef: React.RefObject<Element>,
  onIntersect: () => void,
  options: IntersectionObserverInit = {}
) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [targetRef, onIntersect, options]);
}