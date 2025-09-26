import type { Card, SmartSpace, Profile, QuickCapture } from '../../types';

export interface OfflineStorage {
  // Cards
  getCards(userId: string): Promise<Card[]>;
  getCard(id: string): Promise<Card | null>;
  saveCard(card: Card): Promise<void>;
  deleteCard(id: string): Promise<void>;

  // Smart Spaces
  getSmartSpaces(userId: string): Promise<SmartSpace[]>;
  getSmartSpace(id: string): Promise<SmartSpace | null>;
  saveSmartSpace(space: SmartSpace): Promise<void>;
  deleteSmartSpace(id: string): Promise<void>;

  // Profile
  getProfile(userId: string): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<void>;

  // Sync queue
  addToSyncQueue(operation: SyncOperation): Promise<void>;
  getSyncQueue(): Promise<SyncOperation[]>;
  removeSyncOperation(id: string): Promise<void>;
  clearSyncQueue(): Promise<void>;

  // Metadata
  getLastSyncTime(): Promise<Date | null>;
  setLastSyncTime(time: Date): Promise<void>;
  isOnline(): boolean;
  setOnlineStatus(online: boolean): void;

  // Database management
  init(): Promise<void>;
  close(): Promise<void>;
  clear(): Promise<void>;
}

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'cards' | 'smart_spaces' | 'profiles';
  data: any;
  timestamp: string;
  userId: string;
  retryCount: number;
  lastError?: string;
}

export interface ConflictResolution {
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  resolvedData?: any;
  mergeKey?: string;
}

export interface SyncResult {
  success: boolean;
  operations: number;
  conflicts: number;
  errors: string[];
}

// Web implementation using IndexedDB
export class WebOfflineStorage implements OfflineStorage {
  private db: IDBDatabase | null = null;
  private dbName = 'floe_offline';
  private version = 1;
  private isOnlineStatus = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnlineStatus(true));
      window.addEventListener('offline', () => this.setOnlineStatus(false));
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Cards store
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('user_id', 'user_id', { unique: false });
          cardStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Smart spaces store
        if (!db.objectStoreNames.contains('smart_spaces')) {
          const spaceStore = db.createObjectStore('smart_spaces', { keyPath: 'id' });
          spaceStore.createIndex('user_id', 'user_id', { unique: false });
        }

        // Profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async getCards(userId: string): Promise<Card[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cards'], 'readonly');
      const store = transaction.objectStore('cards');
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getCard(id: string): Promise<Card | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cards'], 'readonly');
      const store = transaction.objectStore('cards');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveCard(card: Card): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cards'], 'readwrite');
      const store = transaction.objectStore('cards');
      const request = store.put(card);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCard(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cards'], 'readwrite');
      const store = transaction.objectStore('cards');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSmartSpaces(userId: string): Promise<SmartSpace[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['smart_spaces'], 'readonly');
      const store = transaction.objectStore('smart_spaces');
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getSmartSpace(id: string): Promise<SmartSpace | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['smart_spaces'], 'readonly');
      const store = transaction.objectStore('smart_spaces');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSmartSpace(space: SmartSpace): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['smart_spaces'], 'readwrite');
      const store = transaction.objectStore('smart_spaces');
      const request = store.put(space);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSmartSpace(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['smart_spaces'], 'readwrite');
      const store = transaction.objectStore('smart_spaces');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getProfile(userId: string): Promise<Profile | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readonly');
      const store = transaction.objectStore('profiles');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProfile(profile: Profile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readwrite');
      const store = transaction.objectStore('profiles');
      const request = store.put(profile);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(operation: SyncOperation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncOperation(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLastSyncTime(): Promise<Date | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get('last_sync_time');

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? new Date(result.value) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setLastSyncTime(time: Date): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({
        key: 'last_sync_time',
        value: time.toISOString()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  setOnlineStatus(online: boolean): void {
    this.isOnlineStatus = online;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    const stores = ['cards', 'smart_spaces', 'profiles', 'sync_queue', 'metadata'];
    const transaction = this.db.transaction(stores, 'readwrite');

    const promises = stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }
}

// Mobile implementation using SQLite (React Native)
export class MobileOfflineStorage implements OfflineStorage {
  // Note: This would use react-native-sqlite-storage or expo-sqlite
  // Implementation would be similar but using SQLite instead of IndexedDB
  // For now, providing interface structure

  private isOnlineStatus = true;

  async init(): Promise<void> {
    // Initialize SQLite database
    // Create tables for cards, smart_spaces, profiles, sync_queue, metadata
    console.log('Mobile SQLite storage initialized');
  }

  async getCards(userId: string): Promise<Card[]> {
    // SELECT * FROM cards WHERE user_id = ?
    return [];
  }

  async getCard(id: string): Promise<Card | null> {
    // SELECT * FROM cards WHERE id = ?
    return null;
  }

  async saveCard(card: Card): Promise<void> {
    // INSERT OR REPLACE INTO cards (...)
  }

  async deleteCard(id: string): Promise<void> {
    // DELETE FROM cards WHERE id = ?
  }

  async getSmartSpaces(userId: string): Promise<SmartSpace[]> {
    return [];
  }

  async getSmartSpace(id: string): Promise<SmartSpace | null> {
    return null;
  }

  async saveSmartSpace(space: SmartSpace): Promise<void> {
    // Implementation
  }

  async deleteSmartSpace(id: string): Promise<void> {
    // Implementation
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return null;
  }

  async saveProfile(profile: Profile): Promise<void> {
    // Implementation
  }

  async addToSyncQueue(operation: SyncOperation): Promise<void> {
    // Implementation
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    return [];
  }

  async removeSyncOperation(id: string): Promise<void> {
    // Implementation
  }

  async clearSyncQueue(): Promise<void> {
    // Implementation
  }

  async getLastSyncTime(): Promise<Date | null> {
    return null;
  }

  async setLastSyncTime(time: Date): Promise<void> {
    // Implementation
  }

  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  setOnlineStatus(online: boolean): void {
    this.isOnlineStatus = online;
  }

  async close(): Promise<void> {
    // Close SQLite connection
  }

  async clear(): Promise<void> {
    // Clear all tables
  }
}

// Factory function to create appropriate storage
export function createOfflineStorage(): OfflineStorage {
  // Detect environment
  if (typeof window !== 'undefined' && window.indexedDB) {
    return new WebOfflineStorage();
  } else {
    return new MobileOfflineStorage();
  }
}