import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// Setup global vi for tests
(globalThis as typeof globalThis & { vi: typeof vi }).vi = vi;

// React 19: Automatic cleanup after each test
afterEach(() => {
  cleanup();
});

// React 19 compatibility: Mock window.matchMedia for theme detection
const mockMatchMedia = vi.fn().mockImplementation((query: string) => {
  const mediaQueryList = {
    matches: query === '(prefers-color-scheme: dark)' ? false : false, // Default to light theme
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  return mediaQueryList;
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock Tauri APIs for testing
const mockTauriCore = {
  invoke: vi.fn().mockResolvedValue(null),
};

// Enhanced Tauri Store mock for theme system
const mockStoreInstance = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
};

const mockTauriStore = {
  Store: {
    // Mock the static load method
    load: vi.fn().mockResolvedValue(mockStoreInstance),
    // Also provide constructor if needed
    new: vi.fn().mockImplementation(() => mockStoreInstance),
  },
  // Export mock instance for direct access in tests
  __mockStore: mockStoreInstance,
};

// Mock Tauri modules
vi.mock('@tauri-apps/api/core', () => mockTauriCore);
vi.mock('@tauri-apps/plugin-store', () => mockTauriStore);

// Mock Tauri dialog
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn().mockResolvedValue(null),
}));

// Mock Tauri filesystem
vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir: vi.fn().mockResolvedValue([]),
  exists: vi.fn().mockResolvedValue(false),
}));

// React 19: Enhanced test utilities
import { act } from '@testing-library/react';

// Export act for easier imports in tests
export { act };

// Global test utilities for React 19
(globalThis as typeof globalThis & {
  vi: typeof vi;
  act: typeof act;
}).act = act;
