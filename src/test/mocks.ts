import { vi } from 'vitest';

// Mock function instances at module scope.
// Vitest hoists variables prefixed with "mock" alongside vi.mock calls,
// so these can be safely referenced inside vi.mock factory functions.
const mockInvoke = vi.fn().mockResolvedValue(null);
const mockConvertFileSrc = vi.fn((path: string) => `asset://${path}`);
const mockDialogOpen = vi.fn().mockResolvedValue(null);
const mockBasename = vi.fn((path: string) => path.split('/').pop() || '');
const mockDirname = vi.fn(
  (path: string) => path.split('/').slice(0, -1).join('/') || '/',
);
const mockOpenerOpen = vi.fn();
const mockReadDir = vi.fn().mockResolvedValue([]);
const mockExists = vi.fn().mockResolvedValue(false);

/**
 * Shared mock store instance - exported for test access
 */
export const mockStoreInstance = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
};

// Declared after mockStoreInstance to avoid temporal dead zone
const mockStoreLoad = vi.fn().mockResolvedValue(mockStoreInstance);

/**
 * Setup standardized mocks for Tauri APIs
 */
export const setupTauriMocks = () => {
  // Mock Tauri core APIs
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: mockInvoke,
    convertFileSrc: mockConvertFileSrc,
  }));

  // Mock Tauri dialog plugin
  vi.mock('@tauri-apps/plugin-dialog', () => ({
    open: mockDialogOpen,
  }));

  // Mock Tauri path utilities
  vi.mock('@tauri-apps/api/path', () => ({
    basename: mockBasename,
    dirname: mockDirname,
  }));

  // Mock Tauri opener plugin
  vi.mock('@tauri-apps/plugin-opener', () => ({
    open: mockOpenerOpen,
  }));

  // Mock Tauri filesystem plugin
  vi.mock('@tauri-apps/plugin-fs', () => ({
    readDir: mockReadDir,
    exists: mockExists,
  }));

  // Mock Tauri store plugin
  vi.mock('@tauri-apps/plugin-store', () => ({
    Store: {
      load: mockStoreLoad,
    },
  }));
};

/**
 * Reset all mocks and re-apply default implementations.
 * Calls vi.resetAllMocks() for a complete reset (including one-time implementations),
 * then restores the expected default return values so subsequent tests start consistently.
 */
export const resetAllMocks = () => {
  vi.resetAllMocks();
  vi.clearAllTimers();

  // Re-apply default implementations after reset
  mockInvoke.mockResolvedValue(null);
  mockConvertFileSrc.mockImplementation((path: string) => `asset://${path}`);
  mockDialogOpen.mockResolvedValue(null);
  mockBasename.mockImplementation(
    (path: string) => path.split('/').pop() || '',
  );
  mockDirname.mockImplementation(
    (path: string) => path.split('/').slice(0, -1).join('/') || '/',
  );
  mockReadDir.mockResolvedValue([]);
  mockExists.mockResolvedValue(false);
  mockStoreLoad.mockResolvedValue(mockStoreInstance);
  mockStoreInstance.get.mockResolvedValue(null);
  mockStoreInstance.set.mockResolvedValue(undefined);
  mockStoreInstance.save.mockResolvedValue(undefined);
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
