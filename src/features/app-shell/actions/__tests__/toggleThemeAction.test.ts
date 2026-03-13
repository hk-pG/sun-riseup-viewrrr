import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toggleThemeAction } from '../toggleThemeAction';
import type { ActionContext } from '../types';

function createMockContext(overrides?: Partial<ActionContext>): ActionContext {
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

describe('toggleThemeAction', () => {
  let ctx: ActionContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('switches from dark to light', async () => {
    ctx = createMockContext({ themeApi: { theme: 'dark', setTheme: vi.fn() } });

    await toggleThemeAction(ctx);

    expect(ctx.themeApi.setTheme).toHaveBeenCalledWith('light');
  });

  it('switches from light to dark', async () => {
    ctx = createMockContext({
      themeApi: { theme: 'light', setTheme: vi.fn() },
    });

    await toggleThemeAction(ctx);

    expect(ctx.themeApi.setTheme).toHaveBeenCalledWith('dark');
  });
});
