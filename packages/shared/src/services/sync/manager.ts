import { supabase } from '@floe/supabase';
import { RealtimeManager, RealtimeCallbacks } from './realtime';
import { createOfflineStorage, OfflineStorage, SyncOperation, ConflictResolution, SyncResult } from './offline';
import type { Card, SmartSpace, Profile } from '../../types';

export type { SyncResult } from './offline';

export interface SyncManagerConfig {
  userId: string;
  enableRealtime: boolean;
  enableOffline: boolean;
  syncInterval: number; // milliseconds
  maxRetries: number;
  batchSize: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isRealtime: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  syncing: boolean;
  conflicts: number;
}

export interface SyncCallbacks extends RealtimeCallbacks {
  onSyncStart?: () => void;
  onSyncComplete?: (result: SyncResult) => void;
  onSyncError?: (error: Error) => void;
  onStatusChange?: (status: SyncStatus) => void;
  onConflict?: (conflict: any, resolution: ConflictResolution) => void;
}

export class SyncManager {
  private config: SyncManagerConfig;
  private callbacks: SyncCallbacks;
  private offlineStorage: OfflineStorage;
  private realtimeSubscriptions: string[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private status: SyncStatus;

  constructor(config: SyncManagerConfig, callbacks: SyncCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
    this.offlineStorage = createOfflineStorage();

    this.status = {
      isOnline: true,
      isRealtime: false,
      lastSync: null,
      pendingOperations: 0,
      syncing: false,
      conflicts: 0
    };

    // Initialize connection status
    if (typeof navigator !== 'undefined') {
      this.status.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
      window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
    }
  }

  // Initialize the sync manager
  async init(): Promise<void> {
    try {
      // Initialize offline storage
      if (this.config.enableOffline) {
        await this.offlineStorage.init();
        this.status.lastSync = await this.offlineStorage.getLastSyncTime();
        this.status.pendingOperations = (await this.offlineStorage.getSyncQueue()).length;
      }

      // Setup realtime subscriptions
      if (this.config.enableRealtime && this.status.isOnline) {
        await this.setupRealtimeSubscriptions();
      }

      // Start periodic sync
      this.startPeriodicSync();

      // Perform initial sync
      if (this.status.isOnline) {
        await this.performSync();
      }

      this.notifyStatusChange();
    } catch (error) {
      console.error('Failed to initialize sync manager:', error);
      this.callbacks.onSyncError?.(error instanceof Error ? error : new Error('Initialization failed'));
    }
  }

  // Create or update a card
  async saveCard(card: Card): Promise<Card> {
    try {
      if (this.status.isOnline) {
        // Save directly to server
        const { data, error } = await supabase
          .from('cards')
          .upsert(card)
          .select()
          .single();

        if (error) throw error;

        // Also save to offline storage if enabled
        if (this.config.enableOffline) {
          await this.offlineStorage.saveCard(data);
        }

        return data;
      } else if (this.config.enableOffline) {
        // Save to offline storage and add to sync queue
        await this.offlineStorage.saveCard(card);
        await this.addToSyncQueue('UPDATE', 'cards', card);

        this.status.pendingOperations++;
        this.notifyStatusChange();

        return card;
      } else {
        throw new Error('Cannot save card: offline and no offline storage');
      }
    } catch (error) {
      console.error('Failed to save card:', error);
      throw error;
    }
  }

  // Delete a card
  async deleteCard(cardId: string): Promise<void> {
    try {
      if (this.status.isOnline) {
        // Delete from server
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('id', cardId)
          .eq('user_id', this.config.userId);

        if (error) throw error;

        // Also delete from offline storage if enabled
        if (this.config.enableOffline) {
          await this.offlineStorage.deleteCard(cardId);
        }
      } else if (this.config.enableOffline) {
        // Delete from offline storage and add to sync queue
        await this.offlineStorage.deleteCard(cardId);
        await this.addToSyncQueue('DELETE', 'cards', { id: cardId });

        this.status.pendingOperations++;
        this.notifyStatusChange();
      } else {
        throw new Error('Cannot delete card: offline and no offline storage');
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  }

  // Get cards (prioritize offline if available)
  async getCards(): Promise<Card[]> {
    try {
      if (this.config.enableOffline) {
        return await this.offlineStorage.getCards(this.config.userId);
      } else if (this.status.isOnline) {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', this.config.userId)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to get cards:', error);
      return [];
    }
  }

  // Get a single card
  async getCard(cardId: string): Promise<Card | null> {
    try {
      if (this.config.enableOffline) {
        return await this.offlineStorage.getCard(cardId);
      } else if (this.status.isOnline) {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('id', cardId)
          .eq('user_id', this.config.userId)
          .is('deleted_at', null)
          .single();

        if (error) throw error;
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get card:', error);
      return null;
    }
  }

  // Save smart space
  async saveSmartSpace(space: SmartSpace): Promise<SmartSpace> {
    try {
      if (this.status.isOnline) {
        // Save directly to server
        const { data, error } = await supabase
          .from('smart_spaces')
          .upsert(space)
          .select()
          .single();

        if (error) throw error;

        // Also save to offline storage if enabled
        if (this.config.enableOffline) {
          await this.offlineStorage.saveSmartSpace(data);
        }

        return data;
      } else if (this.config.enableOffline) {
        // Save to offline storage and add to sync queue
        await this.offlineStorage.saveSmartSpace(space);
        await this.addToSyncQueue('UPDATE', 'smart_spaces', space);

        this.status.pendingOperations++;
        this.notifyStatusChange();

        return space;
      } else {
        throw new Error('Cannot save smart space: offline and no offline storage');
      }
    } catch (error) {
      console.error('Failed to save smart space:', error);
      throw error;
    }
  }

  // Get smart spaces
  async getSmartSpaces(): Promise<SmartSpace[]> {
    try {
      if (this.config.enableOffline) {
        return await this.offlineStorage.getSmartSpaces(this.config.userId);
      } else if (this.status.isOnline) {
        const { data, error } = await supabase
          .from('smart_spaces')
          .select('*')
          .eq('user_id', this.config.userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to get smart spaces:', error);
      return [];
    }
  }

  // Perform full synchronization
  async performSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, operations: 0, conflicts: 0, errors: ['Sync already in progress'] };
    }

    this.isSyncing = true;
    this.status.syncing = true;
    this.callbacks.onSyncStart?.();
    this.notifyStatusChange();

    const result: SyncResult = {
      success: true,
      operations: 0,
      conflicts: 0,
      errors: []
    };

    try {
      if (!this.status.isOnline) {
        throw new Error('Cannot sync while offline');
      }

      if (!this.config.enableOffline) {
        // No offline storage, just fetch latest data
        return { success: true, operations: 0, conflicts: 0, errors: [] };
      }

      // Step 1: Push pending operations to server
      const pendingOps = await this.offlineStorage.getSyncQueue();

      for (const operation of pendingOps) {
        try {
          await this.executeSyncOperation(operation);
          await this.offlineStorage.removeSyncOperation(operation.id);
          result.operations++;
        } catch (error) {
          result.errors.push(`Failed to sync ${operation.type} on ${operation.table}: ${error}`);

          // Update retry count
          operation.retryCount++;
          operation.lastError = error instanceof Error ? error.message : String(error);

          if (operation.retryCount >= this.config.maxRetries) {
            await this.offlineStorage.removeSyncOperation(operation.id);
            console.warn('Max retries reached for operation:', operation);
          } else {
            await this.offlineStorage.addToSyncQueue(operation);
          }
        }
      }

      // Step 2: Pull latest data from server
      await this.pullLatestData();

      // Update sync status
      await this.offlineStorage.setLastSyncTime(new Date());
      this.status.lastSync = new Date();
      this.status.pendingOperations = (await this.offlineStorage.getSyncQueue()).length;

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      this.callbacks.onSyncError?.(error instanceof Error ? error : new Error('Sync failed'));
    } finally {
      this.isSyncing = false;
      this.status.syncing = false;
      this.notifyStatusChange();
      this.callbacks.onSyncComplete?.(result);
    }

    return result;
  }

  // Force sync immediately
  async forcSync(): Promise<SyncResult> {
    return await this.performSync();
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  // Clean up and dispose
  async dispose(): Promise<void> {
    // Stop periodic sync
    this.stopPeriodicSync();

    // Unsubscribe from realtime
    this.realtimeSubscriptions.forEach(id => {
      RealtimeManager.unsubscribe(id);
    });

    // Close offline storage
    if (this.config.enableOffline) {
      await this.offlineStorage.close();
    }

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnlineStatusChange.bind(this));
      window.removeEventListener('offline', this.handleOnlineStatusChange.bind(this));
    }
  }

  private async setupRealtimeSubscriptions(): Promise<void> {
    const realtimeCallbacks: RealtimeCallbacks = {
      onCardChange: (event) => {
        this.handleRealtimeCardChange(event);
        this.callbacks.onCardChange?.(event);
      },
      onSmartSpaceChange: (event) => {
        this.handleRealtimeSmartSpaceChange(event);
        this.callbacks.onSmartSpaceChange?.(event);
      },
      onProfileChange: (event) => {
        this.handleRealtimeProfileChange(event);
        this.callbacks.onProfileChange?.(event);
      },
      onConnected: () => {
        this.status.isRealtime = true;
        this.callbacks.onConnected?.();
        this.notifyStatusChange();
      },
      onDisconnected: () => {
        this.status.isRealtime = false;
        this.callbacks.onDisconnected?.();
        this.notifyStatusChange();
      },
      onError: this.callbacks.onError
    };

    const subscriptionId = RealtimeManager.subscribeToUserData(this.config.userId, realtimeCallbacks);
    this.realtimeSubscriptions.push(subscriptionId);
  }

  private async handleRealtimeCardChange(event: any): Promise<void> {
    if (!this.config.enableOffline) return;

    try {
      switch (event.eventType) {
        case 'INSERT':
        case 'UPDATE':
          if (event.new) {
            await this.offlineStorage.saveCard(event.new as Card);
          }
          break;
        case 'DELETE':
          if (event.old) {
            await this.offlineStorage.deleteCard(event.old.id);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to handle realtime card change:', error);
    }
  }

  private async handleRealtimeSmartSpaceChange(event: any): Promise<void> {
    if (!this.config.enableOffline) return;

    try {
      switch (event.eventType) {
        case 'INSERT':
        case 'UPDATE':
          if (event.new) {
            await this.offlineStorage.saveSmartSpace(event.new as SmartSpace);
          }
          break;
        case 'DELETE':
          if (event.old) {
            await this.offlineStorage.deleteSmartSpace(event.old.id);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to handle realtime smart space change:', error);
    }
  }

  private async handleRealtimeProfileChange(event: any): Promise<void> {
    if (!this.config.enableOffline) return;

    try {
      if (event.new && (event.eventType === 'INSERT' || event.eventType === 'UPDATE')) {
        await this.offlineStorage.saveProfile(event.new as Profile);
      }
    } catch (error) {
      console.error('Failed to handle realtime profile change:', error);
    }
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(async () => {
      if (this.status.isOnline && this.status.pendingOperations > 0) {
        await this.performSync();
      }
    }, this.config.syncInterval);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async addToSyncQueue(type: SyncOperation['type'], table: SyncOperation['table'], data: any): Promise<void> {
    const operation: SyncOperation = {
      id: `${type}_${table}_${Date.now()}_${Math.random()}`,
      type,
      table,
      data,
      timestamp: new Date().toISOString(),
      userId: this.config.userId,
      retryCount: 0
    };

    await this.offlineStorage.addToSyncQueue(operation);
  }

  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.table) {
      case 'cards':
        await this.syncCard(operation);
        break;
      case 'smart_spaces':
        await this.syncSmartSpace(operation);
        break;
      case 'profiles':
        await this.syncProfile(operation);
        break;
      default:
        throw new Error(`Unknown table: ${operation.table}`);
    }
  }

  private async syncCard(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'CREATE':
      case 'UPDATE':
        const { error: upsertError } = await supabase
          .from('cards')
          .upsert(operation.data)
          .eq('user_id', this.config.userId);

        if (upsertError) throw upsertError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('cards')
          .delete()
          .eq('id', operation.data.id)
          .eq('user_id', this.config.userId);

        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncSmartSpace(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'CREATE':
      case 'UPDATE':
        const { error: upsertError } = await supabase
          .from('smart_spaces')
          .upsert(operation.data)
          .eq('user_id', this.config.userId);

        if (upsertError) throw upsertError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('smart_spaces')
          .delete()
          .eq('id', operation.data.id)
          .eq('user_id', this.config.userId);

        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncProfile(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'CREATE':
      case 'UPDATE':
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(operation.data)
          .eq('id', this.config.userId);

        if (upsertError) throw upsertError;
        break;
    }
  }

  private async pullLatestData(): Promise<void> {
    const lastSync = await this.offlineStorage.getLastSyncTime();
    const since = lastSync || new Date(0);

    // Pull cards
    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', this.config.userId)
      .gte('updated_at', since.toISOString())
      .is('deleted_at', null);

    if (cards) {
      for (const card of cards) {
        await this.offlineStorage.saveCard(card);
      }
    }

    // Pull smart spaces
    const { data: spaces } = await supabase
      .from('smart_spaces')
      .select('*')
      .eq('user_id', this.config.userId)
      .gte('updated_at', since.toISOString());

    if (spaces) {
      for (const space of spaces) {
        await this.offlineStorage.saveSmartSpace(space);
      }
    }

    // Pull profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', this.config.userId)
      .gte('updated_at', since.toISOString())
      .single();

    if (profile) {
      await this.offlineStorage.saveProfile(profile);
    }
  }

  private handleOnlineStatusChange(): void {
    const wasOnline = this.status.isOnline;
    this.status.isOnline = navigator.onLine;

    if (this.status.isOnline && !wasOnline) {
      // Went online - setup realtime and sync
      if (this.config.enableRealtime) {
        this.setupRealtimeSubscriptions();
      }
      this.performSync();
    } else if (!this.status.isOnline && wasOnline) {
      // Went offline - cleanup realtime
      this.status.isRealtime = false;
      this.realtimeSubscriptions.forEach(id => {
        RealtimeManager.unsubscribe(id);
      });
      this.realtimeSubscriptions = [];
    }

    this.notifyStatusChange();
  }

  private notifyStatusChange(): void {
    this.callbacks.onStatusChange?.(this.getStatus());
  }
}