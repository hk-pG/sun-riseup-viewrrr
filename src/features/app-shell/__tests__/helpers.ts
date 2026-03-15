import { vi } from 'vitest';
import type {
  ActionContext,
  ActionDependencies,
  ResultApplier,
} from '../actions/types';

export function createMockContext(
  overrides?: Partial<ActionContext>,
): ActionContext {
  return {
    fss: {
      openDirectoryDialog: vi.fn().mockResolvedValue(null),
      getBaseName: vi.fn(),
      getDirName: vi.fn(),
      listImagesInFolder: vi.fn(),
      getSiblingFolders: vi.fn(),
      convertFileSrc: vi.fn(),
      getFolderThumbnail: vi.fn().mockResolvedValue(null),
      prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
    },
    openImageFile: vi.fn().mockResolvedValue(null),
    themeApi: { theme: 'dark', setTheme: vi.fn() },
    startTransition: vi.fn((cb: () => void) => cb()),
    setAppState: vi.fn(),
    ...overrides,
  };
}

export function createMockDeps(
  overrides?: Partial<ActionDependencies>,
): ActionDependencies {
  return {
    fss: {
      openDirectoryDialog: vi.fn().mockResolvedValue(null),
      getBaseName: vi.fn(),
      getDirName: vi.fn(),
      listImagesInFolder: vi.fn(),
      getSiblingFolders: vi.fn(),
      convertFileSrc: vi.fn(),
      getFolderThumbnail: vi.fn().mockResolvedValue(null),
      prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
    },
    openImageFile: vi.fn().mockResolvedValue(null),
    currentTheme: 'dark',
    ...overrides,
  };
}

export function createMockApplier(
  overrides?: Partial<ResultApplier>,
): ResultApplier {
  return {
    startTransition: vi.fn((cb: () => void) => cb()),
    setAppState: vi.fn(),
    setTheme: vi.fn(),
    ...overrides,
  };
}
