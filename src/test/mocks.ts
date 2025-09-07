import { vi } from 'vitest';

/**
 * Setup standardized mocks for Tauri APIs
 */
export const setupTauriMocks = () => {
  // Mock Tauri core APIs
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn(),
    convertFileSrc: vi.fn((path: string) => `asset://${path}`),
  }));

  // Mock Tauri dialog plugin
  vi.mock('@tauri-apps/plugin-dialog', () => ({
    open: vi.fn(),
  }));

  // Mock Tauri path utilities
  vi.mock('@tauri-apps/api/path', () => ({
    basename: vi.fn((path: string) => path.split('/').pop() || ''),
    dirname: vi.fn(
      (path: string) => path.split('/').slice(0, -1).join('/') || '/',
    ),
  }));

  // Mock Tauri opener plugin
  vi.mock('@tauri-apps/plugin-opener', () => ({
    open: vi.fn(),
  }));

  // Mock Tauri filesystem plugin
  vi.mock('@tauri-apps/plugin-fs', () => ({
    readDir: vi.fn(),
    exists: vi.fn(),
  }));
};

/**
 * Reset all mocks - useful in beforeEach hooks
 */
export const resetAllMocks = () => {
  vi.resetAllMocks();
  vi.clearAllTimers();
};
