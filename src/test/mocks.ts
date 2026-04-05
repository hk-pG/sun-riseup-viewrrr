import { vi } from 'vitest';
import type { FileSystemService } from '@/features/folder-navigation/services/FileSystemService';

// Default implementations for path utilities - extracted to avoid duplication
// between initialization and resetAllMocks() re-application
const convertFileSrcImpl = (path: string) => `asset://${path}`;
const basenameImpl = (path: string) => path.split('/').pop() || '';
const dirnameImpl = (path: string) =>
  path.split('/').slice(0, -1).join('/') || '/';

// Mock function instances at module scope.
// Vitest hoists variables prefixed with "mock" alongside vi.mock calls,
// so these can be safely referenced inside vi.mock factory functions.
const mockInvoke = vi.fn().mockResolvedValue(null);
const mockConvertFileSrc = vi.fn().mockImplementation(convertFileSrcImpl);
const mockDialogOpen = vi.fn().mockResolvedValue(null);
const mockBasename = vi.fn().mockImplementation(basenameImpl);
const mockDirname = vi.fn().mockImplementation(dirnameImpl);
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
  mockConvertFileSrc.mockImplementation(convertFileSrcImpl);
  mockDialogOpen.mockResolvedValue(null);
  mockBasename.mockImplementation(basenameImpl);
  mockDirname.mockImplementation(dirnameImpl);
  mockReadDir.mockResolvedValue([]);
  mockExists.mockResolvedValue(false);
  mockStoreLoad.mockResolvedValue(mockStoreInstance);
  mockStoreInstance.get.mockResolvedValue(null);
  mockStoreInstance.set.mockResolvedValue(undefined);
  mockStoreInstance.save.mockResolvedValue(undefined);
};

/**
 * Create a standard mock FileSystemService with sensible defaults.
 * All methods return empty/null values. Override specific methods via the partial parameter.
 */
export const createMockFileSystemService = (
  overrides?: Partial<FileSystemService>,
): FileSystemService => ({
  openDirectoryDialog: vi.fn().mockResolvedValue(null),
  openImageFileDialog: vi.fn().mockResolvedValue(null),
  getBaseName: vi
    .fn()
    .mockImplementation(
      async (filePath: string) => filePath.split('/').pop() || '',
    ),
  getDirName: vi
    .fn()
    .mockImplementation(
      async (filePath: string) =>
        filePath.split('/').slice(0, -1).join('/') || '/',
    ),
  listImagesInFolder: vi.fn().mockResolvedValue([]),
  getSiblingFolders: vi.fn().mockResolvedValue([]),
  getSiblingContainers: vi.fn().mockResolvedValue([]),
  convertFileSrc: vi
    .fn()
    .mockImplementation((path: string) => `asset://${path}`),
  clearThumbnailCache: vi.fn().mockResolvedValue(undefined),
  getFolderThumbnail: vi.fn().mockResolvedValue(null),
  prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

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
