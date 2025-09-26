export function createMockCard(overrides: Partial<any> = {}): any {
  return {
    id: crypto.randomUUID(),
    title: 'Test Card',
    content: 'This is test content for a card.',
    type: 'note',
    user_id: 'test-user-id',
    tags: ['test', 'mock'],
    smart_space_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    embedding: null,
    metadata: {},
    ...overrides
  };
}

export function createMockSmartSpace(overrides: Partial<any> = {}): any {
  return {
    id: crypto.randomUUID(),
    name: 'Test Smart Space',
    description: 'A test smart space for automated testing',
    user_id: 'test-user-id',
    color: '#000000',
    icon: null,
    is_active: true,
    auto_include_rules: [],
    auto_exclude_rules: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

export function createMockProfile(overrides: Partial<any> = {}): any {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar_url: null,
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false
      }
    },
    subscription: {
      plan: 'free',
      status: 'active'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

export function createMockMediaFile(overrides: Partial<any> = {}): any {
  return {
    id: crypto.randomUUID(),
    name: 'test-image.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 1024000,
    url: 'https://example.com/test-image.jpg',
    thumbnailUrl: 'https://example.com/test-image-thumb.jpg',
    width: 1920,
    height: 1080,
    extractedText: null,
    metadata: {
      originalName: 'test-image.jpg',
      uploadedBy: 'test-user-id',
      source: 'file'
    },
    processing: {
      status: 'completed',
      progress: 100,
      steps: [],
      completedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

export function createMockSyncStatus(overrides: Partial<any> = {}): any {
  return {
    isOnline: true,
    isRealtime: true,
    lastSync: new Date(),
    pendingOperations: 0,
    syncing: false,
    conflicts: 0,
    ...overrides
  };
}

export function createMockAIResult(overrides: Partial<any> = {}): any {
  return {
    title: 'AI Generated Title',
    summary: 'AI generated summary of the content.',
    keywords: ['ai', 'test', 'mock'],
    tags: ['ai-generated', 'test'],
    suggestedSpaces: ['work', 'personal'],
    contentAnalysis: {
      topics: ['technology', 'testing'],
      sentiment: 'neutral',
      complexity: 'moderate',
      category: 'technical'
    },
    confidence: 0.85,
    processingTime: 1234,
    ...overrides
  };
}

export function createMockSupabaseClient() {
  const mockData = new Map<string, any[]>();

  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: mockData.get(table) || [],
          error: null
        }),
        in: (column: string, values: any[]) => ({
          data: mockData.get(table) || [],
          error: null
        }),
        order: (column: string, options?: any) => ({
          data: mockData.get(table) || [],
          error: null
        }),
        limit: (count: number) => ({
          data: (mockData.get(table) || []).slice(0, count),
          error: null
        })
      }),
      insert: (values: any) => ({
        data: Array.isArray(values) ? values : [values],
        error: null
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          data: [values],
          error: null
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: [],
          error: null
        })
      }),
      upsert: (values: any) => ({
        data: Array.isArray(values) ? values : [values],
        error: null
      })
    }),
    auth: {
      getUser: () => Promise.resolve({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      }),
      signInWithPassword: () => Promise.resolve({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      }),
      signOut: () => Promise.resolve({ error: null })
    },
    channel: (name: string) => ({
      on: () => ({ subscribe: () => Promise.resolve({ status: 'SUBSCRIBED' }) }),
      subscribe: (callback: (status: string) => void) => {
        callback('SUBSCRIBED');
        return Promise.resolve();
      },
      unsubscribe: () => Promise.resolve(),
      track: () => Promise.resolve(),
      presenceState: () => ({}),
      send: () => Promise.resolve()
    }),

    _setMockData: (table: string, data: any[]) => {
      mockData.set(table, data);
    },

    _getMockData: (table: string) => {
      return mockData.get(table) || [];
    }
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await delay(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

export function mockFetch(responses: Record<string, any>) {
  const originalFetch = global.fetch;

  const mockFetch = (url: string, options?: any) => {
    const response = responses[url];

    if (!response) {
      return Promise.reject(new Error(`No mock response defined for ${url}`));
    }

    return Promise.resolve({
      ok: response.status < 400,
      status: response.status || 200,
      json: () => Promise.resolve(response.data || response),
      text: () => Promise.resolve(JSON.stringify(response.data || response)),
      blob: () => Promise.resolve(new Blob([JSON.stringify(response.data || response)])),
      headers: new Headers(response.headers || {})
    });
  };

  global.fetch = mockFetch as any;

  return () => {
    global.fetch = originalFetch;
  };
}

export function mockLocalStorage() {
  const store: Record<string, string> = {};

  const mockStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key in store) {
        delete store[key];
      }
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null
  };

  Object.defineProperty(mockStorage, 'length', {
    get: () => Object.keys(store).length
  });

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true
  });

  return store;
}

export function mockIndexedDB() {
  const databases = new Map<string, Map<string, any[]>>();

  const mockIDB = {
    open: (name: string, version?: number) => {
      const request = {
        onsuccess: null as ((event: any) => void) | null,
        onerror: null as ((event: any) => void) | null,
        onupgradeneeded: null as ((event: any) => void) | null,
        result: null as any
      };

      setTimeout(() => {
        if (!databases.has(name)) {
          databases.set(name, new Map());

          if (request.onupgradeneeded) {
            const db = {
              createObjectStore: (storeName: string, options?: any) => ({
                createIndex: (indexName: string, keyPath: string, options?: any) => {}
              }),
              objectStoreNames: { contains: (name: string) => false }
            };

            request.onupgradeneeded({ target: { result: db } });
          }
        }

        const db = {
          transaction: (storeNames: string | string[], mode?: string) => ({
            objectStore: (storeName: string) => ({
              get: (key: string) => ({
                onsuccess: null as ((event: any) => void) | null,
                onerror: null as ((event: any) => void) | null
              }),
              put: (value: any) => ({
                onsuccess: null as ((event: any) => void) | null,
                onerror: null as ((event: any) => void) | null
              }),
              delete: (key: string) => ({
                onsuccess: null as ((event: any) => void) | null,
                onerror: null as ((event: any) => void) | null
              }),
              clear: () => ({
                onsuccess: null as ((event: any) => void) | null,
                onerror: null as ((event: any) => void) | null
              }),
              index: (indexName: string) => ({
                getAll: (query?: any) => ({
                  onsuccess: null as ((event: any) => void) | null,
                  onerror: null as ((event: any) => void) | null
                })
              })
            })
          }),
          close: () => {}
        };

        request.result = db;

        if (request.onsuccess) {
          request.onsuccess({ target: { result: db } });
        }
      }, 0);

      return request;
    }
  };

  Object.defineProperty(window, 'indexedDB', {
    value: mockIDB,
    writable: true
  });

  return databases;
}

export class TestEventEmitter {
  private listeners = new Map<string, Function[]>();

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export function createTestContext() {
  return {
    user: createMockProfile(),
    supabase: createMockSupabaseClient(),
    cards: [createMockCard(), createMockCard({ title: 'Another Card' })],
    smartSpaces: [createMockSmartSpace(), createMockSmartSpace({ name: 'Work Space' })],
    mediaFiles: [createMockMediaFile()],
    eventEmitter: new TestEventEmitter()
  };
}