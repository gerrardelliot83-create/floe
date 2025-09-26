import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.UPLOADTHING_TOKEN = 'test-uploadthing-token';

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {};
}
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock URLCreateObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock performance.now
if (!global.performance) {
  global.performance = {};
}
if (!global.performance.now) {
  global.performance.now = () => Date.now();
}

// Mock requestAnimationFrame
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = id => clearTimeout(id);

// Mock navigator
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    ...window.navigator,
    onLine: true,
    userAgent: 'Mozilla/5.0 (Test)',
    platform: 'Test'
  }
});

// Mock HTMLElement.animate
HTMLElement.prototype.animate = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  cancel: jest.fn(),
  finish: jest.fn(),
  play: jest.fn(),
  pause: jest.fn()
}));

// Mock Element.scrollTo
Element.prototype.scrollTo = jest.fn();

// Mock window events
const mockEventListeners = new Map();
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = jest.fn((event, listener, options) => {
  if (!mockEventListeners.has(event)) {
    mockEventListeners.set(event, new Set());
  }
  mockEventListeners.get(event).add(listener);
  return originalAddEventListener.call(window, event, listener, options);
});

window.removeEventListener = jest.fn((event, listener, options) => {
  if (mockEventListeners.has(event)) {
    mockEventListeners.get(event).delete(listener);
  }
  return originalRemoveEventListener.call(window, event, listener, options);
});

// Helper to trigger window events in tests
window.triggerEvent = (event, data = {}) => {
  const listeners = mockEventListeners.get(event);
  if (listeners) {
    listeners.forEach(listener => listener(data));
  }
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});