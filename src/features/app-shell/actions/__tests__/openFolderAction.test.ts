import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openFolderAction } from '../openFolderAction';
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

describe('openFolderAction', () => {
  let ctx: ActionContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('calls setAppState via startTransition when dialog returns a path', async () => {
    vi.mocked(ctx.fss.openDirectoryDialog).mockResolvedValue('/some/folder');

    await openFolderAction(ctx);

    expect(ctx.startTransition).toHaveBeenCalledOnce();
    expect(ctx.setAppState).toHaveBeenCalledOnce();
  });

  it('sets currentFolderPath and initialImageIndex: 0', async () => {
    vi.mocked(ctx.fss.openDirectoryDialog).mockResolvedValue('/some/folder');

    await openFolderAction(ctx);

    const updater = vi.mocked(ctx.setAppState).mock.calls[0][0];
    // updater is a callback; invoke it with a dummy prev state
    const prev = { currentFolderPath: '', initialImageIndex: 5 };
    const next =
      typeof updater === 'function' ? updater(prev as never) : updater;

    expect(next).toEqual(
      expect.objectContaining({
        currentFolderPath: '/some/folder',
        initialImageIndex: 0,
      }),
    );
  });

  it('does not call setAppState when dialog is cancelled (null)', async () => {
    vi.mocked(ctx.fss.openDirectoryDialog).mockResolvedValue(null);

    await openFolderAction(ctx);

    expect(ctx.setAppState).not.toHaveBeenCalled();
    expect(ctx.startTransition).not.toHaveBeenCalled();
  });
});
