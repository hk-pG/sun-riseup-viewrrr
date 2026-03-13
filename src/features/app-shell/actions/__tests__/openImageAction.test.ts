import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openImageAction } from '../openImageAction';
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

describe('openImageAction', () => {
  let ctx: ActionContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('calls setAppState via startTransition when openImageFile returns a result', async () => {
    vi.mocked(ctx.openImageFile).mockResolvedValue({
      folderPath: '/images',
      filePath: '/images/pic.png',
      index: 3,
    });

    await openImageAction(ctx);

    expect(ctx.startTransition).toHaveBeenCalledOnce();
    expect(ctx.setAppState).toHaveBeenCalledOnce();
  });

  it('passes folderPath and index from the result to setAppState', async () => {
    vi.mocked(ctx.openImageFile).mockResolvedValue({
      folderPath: '/images/photos',
      filePath: '/images/photos/img.jpg',
      index: 7,
    });

    await openImageAction(ctx);

    const updater = vi.mocked(ctx.setAppState).mock.calls[0][0];
    const prev = { currentFolderPath: '', initialImageIndex: 0 };
    const next =
      typeof updater === 'function' ? updater(prev as never) : updater;

    expect(next).toEqual(
      expect.objectContaining({
        currentFolderPath: '/images/photos',
        initialImageIndex: 7,
      }),
    );
  });

  it('does not call setAppState when openImageFile returns null', async () => {
    vi.mocked(ctx.openImageFile).mockResolvedValue(null);

    await openImageAction(ctx);

    expect(ctx.setAppState).not.toHaveBeenCalled();
    expect(ctx.startTransition).not.toHaveBeenCalled();
  });

  it('does not call setAppState when result has falsy folderPath', async () => {
    vi.mocked(ctx.openImageFile).mockResolvedValue({
      folderPath: '',
      filePath: null,
      index: 0,
    });

    await openImageAction(ctx);

    expect(ctx.setAppState).not.toHaveBeenCalled();
    expect(ctx.startTransition).not.toHaveBeenCalled();
  });
});
