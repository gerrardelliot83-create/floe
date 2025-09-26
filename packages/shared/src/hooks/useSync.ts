import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncManager, SyncManagerConfig, SyncCallbacks, SyncStatus, SyncResult } from '../services/sync/manager';
import type { Card, SmartSpace } from '../types';

export interface UseSyncOptions {
  userId: string;
  enableRealtime?: boolean;
  enableOffline?: boolean;
  syncInterval?: number;
  maxRetries?: number;
  batchSize?: number;
  autoInit?: boolean;
}

export interface UseSyncReturn {
  // Data
  cards: Card[];
  smartSpaces: SmartSpace[];

  // Status
  status: SyncStatus;
  loading: boolean;
  error: string | null;

  // Actions
  saveCard: (card: Card) => Promise<Card>;
  deleteCard: (cardId: string) => Promise<void>;
  getCard: (cardId: string) => Promise<Card | null>;
  saveSmartSpace: (space: SmartSpace) => Promise<SmartSpace>;
  deleteSmartSpace: (spaceId: string) => Promise<void>;
  getSmartSpace: (spaceId: string) => Promise<SmartSpace | null>;

  // Sync control
  sync: () => Promise<SyncResult>;
  forceSync: () => Promise<SyncResult>;
  clearOfflineData: () => Promise<void>;

  // Connection management
  goOnline: () => void;
  goOffline: () => void;
}

export function useSync(options: UseSyncOptions): UseSyncReturn {
  const {
    userId,
    enableRealtime = true,
    enableOffline = true,
    syncInterval = 30000,
    maxRetries = 3,
    batchSize = 50,
    autoInit = true
  } = options;

  const [cards, setCards] = useState<Card[]>([]);
  const [smartSpaces, setSmartSpaces] = useState<SmartSpace[]>([]);
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isRealtime: false,
    lastSync: null,
    pendingOperations: 0,
    syncing: false,
    conflicts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncManagerRef = useRef<SyncManager | null>(null);

  const config: SyncManagerConfig = {
    userId,
    enableRealtime,
    enableOffline,
    syncInterval,
    maxRetries,
    batchSize
  };

  const callbacks: SyncCallbacks = {
    onCardChange: (event) => {
      // Update local cards state
      if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
        if (event.new) {
          setCards(prev => {
            const existing = prev.findIndex(c => c.id === event.new!.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = event.new as Card;
              return updated;
            } else {
              return [event.new as Card, ...prev];
            }
          });
        }
      } else if (event.eventType === 'DELETE' && event.old) {
        setCards(prev => prev.filter(c => c.id !== event.old!.id));
      }
    },

    onSmartSpaceChange: (event) => {
      // Update local smart spaces state
      if (event.eventType === 'INSERT' || event.eventType === 'UPDATE') {
        if (event.new) {
          setSmartSpaces(prev => {
            const existing = prev.findIndex(s => s.id === event.new!.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = event.new as SmartSpace;
              return updated;
            } else {
              return [event.new as SmartSpace, ...prev];
            }
          });
        }
      } else if (event.eventType === 'DELETE' && event.old) {
        setSmartSpaces(prev => prev.filter(s => s.id !== event.old!.id));
      }
    },

    onStatusChange: (newStatus) => {
      setStatus(newStatus);
    },

    onSyncStart: () => {
      setError(null);
    },

    onSyncComplete: (result) => {
      if (!result.success && result.errors.length > 0) {
        setError(result.errors.join(', '));
      } else {
        setError(null);
      }
    },

    onSyncError: (syncError) => {
      setError(syncError.message);
    },

    onConnected: () => {
      console.log('Realtime connected');
    },

    onDisconnected: () => {
      console.log('Realtime disconnected');
    },

    onError: (realtimeError) => {
      console.error('Realtime error:', realtimeError);
    }
  };

  // Initialize sync manager
  useEffect(() => {
    if (!autoInit || !userId) return;

    const initSyncManager = async () => {
      try {
        setLoading(true);
        setError(null);

        const syncManager = new SyncManager(config, callbacks);
        syncManagerRef.current = syncManager;

        await syncManager.init();

        // Load initial data
        const [initialCards, initialSpaces] = await Promise.all([
          syncManager.getCards(),
          syncManager.getSmartSpaces()
        ]);

        setCards(initialCards);
        setSmartSpaces(initialSpaces);
        setStatus(syncManager.getStatus());

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize sync';
        setError(errorMessage);
        console.error('Sync manager initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initSyncManager();

    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.dispose();
        syncManagerRef.current = null;
      }
    };
  }, [userId, autoInit]);

  // Save card with optimistic updates
  const saveCard = useCallback(async (card: Card): Promise<Card> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    try {
      // Optimistic update
      setCards(prev => {
        const existing = prev.findIndex(c => c.id === card.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = card;
          return updated;
        } else {
          return [card, ...prev];
        }
      });

      const savedCard = await syncManagerRef.current.saveCard(card);

      // Update with server response
      setCards(prev => {
        const existing = prev.findIndex(c => c.id === savedCard.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = savedCard;
          return updated;
        }
        return prev;
      });

      return savedCard;
    } catch (err) {
      // Revert optimistic update on error
      await refreshCards();
      throw err;
    }
  }, []);

  // Delete card with optimistic updates
  const deleteCard = useCallback(async (cardId: string): Promise<void> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    const cardToDelete = cards.find(c => c.id === cardId);
    if (!cardToDelete) return;

    try {
      // Optimistic update
      setCards(prev => prev.filter(c => c.id !== cardId));

      await syncManagerRef.current.deleteCard(cardId);
    } catch (err) {
      // Revert optimistic update on error
      setCards(prev => {
        if (!prev.find(c => c.id === cardId)) {
          return [cardToDelete, ...prev];
        }
        return prev;
      });
      throw err;
    }
  }, [cards]);

  // Get single card
  const getCard = useCallback(async (cardId: string): Promise<Card | null> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    return await syncManagerRef.current.getCard(cardId);
  }, []);

  // Save smart space with optimistic updates
  const saveSmartSpace = useCallback(async (space: SmartSpace): Promise<SmartSpace> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    try {
      // Optimistic update
      setSmartSpaces(prev => {
        const existing = prev.findIndex(s => s.id === space.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = space;
          return updated;
        } else {
          return [space, ...prev];
        }
      });

      const savedSpace = await syncManagerRef.current.saveSmartSpace(space);

      // Update with server response
      setSmartSpaces(prev => {
        const existing = prev.findIndex(s => s.id === savedSpace.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = savedSpace;
          return updated;
        }
        return prev;
      });

      return savedSpace;
    } catch (err) {
      // Revert optimistic update on error
      await refreshSmartSpaces();
      throw err;
    }
  }, []);

  // Delete smart space
  const deleteSmartSpace = useCallback(async (spaceId: string): Promise<void> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    const spaceToDelete = smartSpaces.find(s => s.id === spaceId);
    if (!spaceToDelete) return;

    try {
      // Optimistic update
      setSmartSpaces(prev => prev.filter(s => s.id !== spaceId));

      // Note: This would need to be implemented in SyncManager
      // await syncManagerRef.current.deleteSmartSpace(spaceId);
    } catch (err) {
      // Revert optimistic update on error
      setSmartSpaces(prev => {
        if (!prev.find(s => s.id === spaceId)) {
          return [spaceToDelete, ...prev];
        }
        return prev;
      });
      throw err;
    }
  }, [smartSpaces]);

  // Get single smart space
  const getSmartSpace = useCallback(async (spaceId: string): Promise<SmartSpace | null> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    return smartSpaces.find(s => s.id === spaceId) || null;
  }, [smartSpaces]);

  // Refresh cards from storage
  const refreshCards = useCallback(async (): Promise<void> => {
    if (!syncManagerRef.current) return;

    try {
      const freshCards = await syncManagerRef.current.getCards();
      setCards(freshCards);
    } catch (err) {
      console.error('Failed to refresh cards:', err);
    }
  }, []);

  // Refresh smart spaces from storage
  const refreshSmartSpaces = useCallback(async (): Promise<void> => {
    if (!syncManagerRef.current) return;

    try {
      const freshSpaces = await syncManagerRef.current.getSmartSpaces();
      setSmartSpaces(freshSpaces);
    } catch (err) {
      console.error('Failed to refresh smart spaces:', err);
    }
  }, []);

  // Manual sync trigger
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    const result = await syncManagerRef.current.performSync();

    // Refresh local data after sync
    await Promise.all([refreshCards(), refreshSmartSpaces()]);

    return result;
  }, [refreshCards, refreshSmartSpaces]);

  // Force sync (bypass normal intervals)
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    return await syncManagerRef.current.forcSync();
  }, []);

  // Clear all offline data
  const clearOfflineData = useCallback(async (): Promise<void> => {
    if (!syncManagerRef.current) return;

    // This would need to be implemented in SyncManager
    // await syncManagerRef.current.clearOfflineData();

    // Clear local state
    setCards([]);
    setSmartSpaces([]);
  }, []);

  // Manual connection control
  const goOnline = useCallback((): void => {
    // This would typically be handled automatically by the browser
    // but can be useful for testing or manual override
    console.log('Going online...');
  }, []);

  const goOffline = useCallback((): void => {
    // This would typically be handled automatically by the browser
    // but can be useful for testing or manual override
    console.log('Going offline...');
  }, []);

  return {
    // Data
    cards,
    smartSpaces,

    // Status
    status,
    loading,
    error,

    // Actions
    saveCard,
    deleteCard,
    getCard,
    saveSmartSpace,
    deleteSmartSpace,
    getSmartSpace,

    // Sync control
    sync,
    forceSync,
    clearOfflineData,

    // Connection management
    goOnline,
    goOffline
  };
}

// Simpler hook for just sync status
export function useSyncStatus(userId: string): {
  status: SyncStatus;
  isOnline: boolean;
  isRealtime: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSync: Date | null;
} {
  const { status } = useSync({
    userId,
    autoInit: true,
    enableRealtime: true,
    enableOffline: true
  });

  return {
    status,
    isOnline: status.isOnline,
    isRealtime: status.isRealtime,
    isSyncing: status.syncing,
    pendingOperations: status.pendingOperations,
    lastSync: status.lastSync
  };
}

// Hook for connection status only
export function useConnectionStatus(): {
  isOnline: boolean;
  isRealtime: boolean;
  connectionType: 'online' | 'offline' | 'realtime';
} {
  const [isOnline, setIsOnline] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const connectionType = isRealtime ? 'realtime' : isOnline ? 'online' : 'offline';

  return {
    isOnline,
    isRealtime,
    connectionType
  };
}