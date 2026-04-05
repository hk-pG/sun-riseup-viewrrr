import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { setupTauriMocks } from './mocks';

// Setup global vi for tests
(globalThis as typeof globalThis & { vi: typeof vi }).vi = vi;

// React 19: Automatic cleanup after each test
afterEach(() => {
  cleanup();
});

// React 19 compatibility: Mock window.matchMedia for theme detection
const mockMatchMedia = vi.fn().mockImplementation((query: string) => {
  const mediaQueryList = {
    matches: false, // Default to light theme
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

// Setup Tauri API mocks (centralized in mocks.ts)
setupTauriMocks();

// React 19: Enhanced test utilities
import { act } from '@testing-library/react';

// Export act for easier imports in tests
export { act };

// Global test utilities for React 19
(
  globalThis as typeof globalThis & {
    vi: typeof vi;
    act: typeof act;
  }
).act = act;
