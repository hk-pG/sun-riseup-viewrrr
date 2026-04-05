import { vi } from 'vitest';

/**
 * Shared mock store instance - exported for test access
 */
export const mockStoreInstance = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
};

/**
 * Setup standardized mocks for Tauri APIs
 */
export const setupTauriMocks = () => {
  // Mock Tauri core APIs
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn().mockResolvedValue(null),
    convertFileSrc: vi.fn((path: string) => `asset://${path}`),
  }));

  // Mock Tauri dialog plugin
  vi.mock('@tauri-apps/plugin-dialog', () => ({
    open: vi.fn().mockResolvedValue(null),
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
    readDir: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(false),
  }));

  // Mock Tauri store plugin
  vi.mock('@tauri-apps/plugin-store', () => ({
    Store: {
      load: vi.fn().mockResolvedValue(mockStoreInstance),
    },
  }));
};

/**
 * Reset all mocks - useful in beforeEach hooks
 */
export const resetAllMocks = () => {
  vi.resetAllMocks();
  vi.clearAllTimers();
};

/**
 * Create a mock FileSystemService for thumbnail testing (001-rust-thumbnail-optimization)
 */
export const createMockFileSystemServiceWithThumbnails = () => ({
  openDirectoryDialog: vi.fn().mockResolvedValue('/mock/path'),
  getBaseName: vi.fn().mockResolvedValue('mockfile.jpg'),
  getDirName: vi.fn().mockResolvedValue('/mock'),
  convertFileSrc: vi.fn((path: string) => `asset://${path}`),
  listImagesInFolder: vi.fn().mockResolvedValue([]),
  getSiblingFolders: vi.fn().mockResolvedValue([]),
  clearThumbnailCache: vi.fn().mockResolvedValue(undefined),
  getFolderThumbnail: vi.fn().mockResolvedValue({
    imagePath: '/mock/image.jpg',
    thumbnailPath: '/mock/cache/thumb.jpg',
    imageName: 'image.jpg',
  }),
  prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
});
