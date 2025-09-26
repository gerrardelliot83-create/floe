'use client';

import React, { useRef, forwardRef, useMemo } from 'react';
import { useVirtualization, useInfiniteQuery, useIntersectionObserver } from '@floe/shared';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  height: number;
  width?: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export const VirtualizedList = forwardRef<HTMLDivElement, VirtualizedListProps<any>>(
  <T,>({
    items,
    itemHeight,
    renderItem,
    height,
    width = '100%',
    overscan = 5,
    className = '',
    onEndReached,
    endReachedThreshold = 0.8,
    loading = false,
    loadingComponent,
    emptyComponent,
    ...props
  }: VirtualizedListProps<T>, ref: React.Ref<HTMLDivElement>) => {
    const scrollElementRef = useRef<HTMLDivElement>(null);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    const getItemSize = useMemo(() => {
      return typeof itemHeight === 'function' ? itemHeight : () => itemHeight;
    }, [itemHeight]);

    const virtualization = useVirtualization({
      itemCount: items.length,
      getItemSize,
      overscan,
      getScrollElement: () => scrollElementRef.current
    });

    const { virtualItems, totalSize } = virtualization;

    useIntersectionObserver(
      loadingTriggerRef,
      () => {
        if (onEndReached && !loading) {
          onEndReached();
        }
      },
      { threshold: 0.1 }
    );

    if (items.length === 0 && !loading) {
      return (
        <div
          ref={ref}
          className={`flex items-center justify-center ${className}`}
          style={{ height, width }}
        >
          {emptyComponent || (
            <div className="text-center text-text-secondary-light dark:text-text-secondary-dark">
              No items to display
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`overflow-auto ${className}`}
        style={{ height, width }}
        {...props}
      >
        <div
          ref={scrollElementRef}
          className="relative"
          style={{ height: totalSize }}
        >
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={virtualItem.index}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                  height: virtualItem.size
                }}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}

          {onEndReached && items.length > 0 && (
            <div
              ref={loadingTriggerRef}
              className="absolute w-full"
              style={{
                top: Math.max(0, totalSize * endReachedThreshold),
                height: 1
              }}
            />
          )}

          {loading && (
            <div className="absolute bottom-0 left-0 w-full flex items-center justify-center p-md">
              {loadingComponent || (
                <div className="flex items-center space-x-xs text-text-secondary-light dark:text-text-secondary-dark">
                  <div className="animate-spin">◐</div>
                  <span className="text-sm">Loading...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

VirtualizedList.displayName = 'VirtualizedList';

export interface InfiniteVirtualizedListProps<T> {
  queryFn: (page: number, pageSize: number) => Promise<T[]>;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number | ((index: number) => number);
  height: number;
  width?: number;
  pageSize?: number;
  overscan?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
}

export function InfiniteVirtualizedList<T>({
  queryFn,
  renderItem,
  itemHeight,
  height,
  width = '100%',
  pageSize = 20,
  overscan = 5,
  className = '',
  loadingComponent,
  emptyComponent,
  errorComponent,
}: InfiniteVirtualizedListProps<T>) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    refetch
  } = useInfiniteQuery({
    queryFn,
    pageSize
  });

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height, width }}>
        {errorComponent ? (
          errorComponent(error, refetch)
        ) : (
          <div className="text-center space-y-sm">
            <div className="text-red-500">Failed to load data</div>
            <button
              onClick={refetch}
              className="text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <VirtualizedList
      items={data}
      itemHeight={itemHeight}
      renderItem={renderItem}
      height={height}
      width={width}
      overscan={overscan}
      className={className}
      onEndReached={handleEndReached}
      loading={isFetchingNextPage}
      loadingComponent={loadingComponent}
      emptyComponent={isLoading ? (
        <div className="flex items-center justify-center space-x-xs">
          <div className="animate-spin">◐</div>
          <span>Loading...</span>
        </div>
      ) : emptyComponent}
    />
  );
}

export interface GridVirtualizationProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  columns: number;
  height: number;
  width?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemWidth,
  itemHeight,
  columns,
  height,
  width = '100%',
  gap = 0,
  overscan = 5,
  className = '',
  onEndReached,
  loading = false,
  loadingComponent,
  emptyComponent
}: GridVirtualizationProps<T>) {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const rowHeight = itemHeight + gap;
  const rowCount = Math.ceil(items.length / columns);

  const virtualization = useVirtualization({
    itemCount: rowCount,
    getItemSize: () => rowHeight,
    overscan,
    getScrollElement: () => scrollElementRef.current
  });

  const { virtualItems, totalSize } = virtualization;

  const loadingTriggerRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver(
    loadingTriggerRef,
    () => {
      if (onEndReached && !loading) {
        onEndReached();
      }
    },
    { threshold: 0.1 }
  );

  if (items.length === 0 && !loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        {emptyComponent || (
          <div className="text-center text-text-secondary-light dark:text-text-secondary-dark">
            No items to display
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height, width }}
    >
      <div className="relative" style={{ height: totalSize }}>
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const endIndex = Math.min(startIndex + columns, items.length);
          const rowItems = items.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.index}
              className="absolute top-0 left-0 w-full flex"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                height: itemHeight,
                gap
              }}
            >
              {rowItems.map((item, columnIndex) => (
                <div
                  key={startIndex + columnIndex}
                  style={{ width: itemWidth, height: itemHeight }}
                >
                  {renderItem(item, startIndex + columnIndex)}
                </div>
              ))}
            </div>
          );
        })}

        {onEndReached && items.length > 0 && (
          <div
            ref={loadingTriggerRef}
            className="absolute w-full"
            style={{
              top: Math.max(0, totalSize * 0.8),
              height: 1
            }}
          />
        )}

        {loading && (
          <div className="absolute bottom-0 left-0 w-full flex items-center justify-center p-md">
            {loadingComponent || (
              <div className="flex items-center space-x-xs text-text-secondary-light dark:text-text-secondary-dark">
                <div className="animate-spin">◐</div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}