import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Setup global vi for tests
(globalThis as typeof globalThis & { vi: typeof vi }).vi = vi;

// React 19 compatibility: Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Tauri APIs for testing
const mockTauriCore = {
  invoke: vi.fn().mockResolvedValue(null),
};

const mockTauriStore = {
  Store: {
    load: vi.fn().mockResolvedValue({}),
    save: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
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
