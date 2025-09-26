import { useState, useEffect, useCallback } from 'react';
import { SmartSpacesManager } from '../services/smartspaces/manager';
import type { SmartSpace, Card } from '../types';

export interface UseSmartSpacesOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseSmartSpacesReturn {
  smartSpaces: SmartSpace[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSpace: (options: any) => Promise<SmartSpace>;
  updateSpace: (spaceId: string, options: any) => Promise<SmartSpace>;
  deleteSpace: (spaceId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useSmartSpaces({
  userId,
  autoRefresh = false,
  refreshInterval = 30000
}: UseSmartSpacesOptions): UseSmartSpacesReturn {
  const [smartSpaces, setSmartSpaces] = useState<SmartSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const spaces = await SmartSpacesManager.getUserSmartSpaces(userId);
      setSmartSpaces(spaces);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load smart spaces';
      setError(errorMessage);
      console.error('Smart spaces refresh failed:', err);
    }
  }, [userId]);

  const loadSmartSpaces = useCallback(async () => {
    setLoading(true);
    await refresh();
    setLoading(false);
  }, [refresh]);

  const createSpace = useCallback(async (options: any): Promise<SmartSpace> => {
    try {
      setError(null);
      const newSpace = await SmartSpacesManager.createSmartSpace({
        ...options,
        userId
      });
      await refresh(); // Refresh the list
      return newSpace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create smart space';
      setError(errorMessage);
      throw err;
    }
  }, [userId, refresh]);

  const updateSpace = useCallback(async (spaceId: string, options: any): Promise<SmartSpace> => {
    try {
      setError(null);
      const updatedSpace = await SmartSpacesManager.updateSmartSpace({
        spaceId,
        userId,
        ...options
      });
      await refresh(); // Refresh the list
      return updatedSpace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update smart space';
      setError(errorMessage);
      throw err;
    }
  }, [userId, refresh]);

  const deleteSpace = useCallback(async (spaceId: string): Promise<void> => {
    try {
      setError(null);
      await SmartSpacesManager.deleteSmartSpace(spaceId, userId);
      await refresh(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete smart space';
      setError(errorMessage);
      throw err;
    }
  }, [userId, refresh]);

  const refreshAll = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await SmartSpacesManager.refreshUserSmartSpaces(userId);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh smart spaces';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, refresh]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadSmartSpaces();
    }
  }, [userId, loadSmartSpaces]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const intervalId = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, userId, refresh, refreshInterval]);

  return {
    smartSpaces,
    loading,
    error,
    refresh,
    createSpace,
    updateSpace,
    deleteSpace,
    refreshAll
  };
}

export interface UseSmartSpaceCardsOptions {
  spaceId: string;
  userId: string;
  limit?: number;
  autoRefresh?: boolean;
}

export interface UseSmartSpaceCardsReturn {
  cards: Card[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useSmartSpaceCards({
  spaceId,
  userId,
  limit = 50,
  autoRefresh = false
}: UseSmartSpaceCardsOptions): UseSmartSpaceCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const newCards = await SmartSpacesManager.getSmartSpaceCards(spaceId, userId, limit, 0);
      setCards(newCards);
      setOffset(newCards.length);
      setHasMore(newCards.length === limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cards';
      setError(errorMessage);
      console.error('Smart space cards refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [spaceId, userId, limit]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setError(null);
      setLoading(true);
      const newCards = await SmartSpacesManager.getSmartSpaceCards(spaceId, userId, limit, offset);

      if (newCards.length === 0) {
        setHasMore(false);
      } else {
        setCards(prev => [...prev, ...newCards]);
        setOffset(prev => prev + newCards.length);
        setHasMore(newCards.length === limit);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more cards';
      setError(errorMessage);
      console.error('Load more cards failed:', err);
    } finally {
      setLoading(false);
    }
  }, [spaceId, userId, limit, offset, loading, hasMore]);

  // Initial load when spaceId changes
  useEffect(() => {
    if (spaceId && userId) {
      setOffset(0);
      setHasMore(true);
      refresh();
    }
  }, [spaceId, userId, refresh]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !spaceId || !userId) return;

    const intervalId = setInterval(() => {
      refresh();
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [autoRefresh, spaceId, userId, refresh]);

  return {
    cards,
    loading,
    error,
    refresh,
    loadMore,
    hasMore
  };
}

// Hook for creating default smart spaces for new users
export function useCreateDefaultSmartSpaces() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDefaults = useCallback(async (userId: string): Promise<SmartSpace[]> => {
    try {
      setLoading(true);
      setError(null);
      const defaultSpaces = await SmartSpacesManager.createDefaultSmartSpaces(userId);
      return defaultSpaces;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create default smart spaces';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDefaults,
    loading,
    error
  };
}