import { describe, expect, it, vi } from 'vitest';
import { createMockFileSystemService } from '@/test/mocks';
import { openFolderAction } from '../openFolderAction';

describe('openFolderAction', () => {
  it('フォルダ選択成功時: FolderSelectedResult を返す', async () => {
    const fss = createMockFileSystemService({
      openDirectoryDialog: vi.fn().mockResolvedValue('/some/folder'),
    });

    const result = await openFolderAction(fss);

    expect(result).toEqual({
      type: 'folder-selected',
      folderPath: '/some/folder',
      initialImageIndex: 0,
    });
  });

  it('フォルダ選択成功時: initialImageIndex は常に 0', async () => {
    const fss = createMockFileSystemService({
      openDirectoryDialog: vi.fn().mockResolvedValue('/another/folder'),
    });

    const result = await openFolderAction(fss);

    expect(result?.initialImageIndex).toBe(0);
  });

  it('キャンセル時（null）: null を返す', async () => {
    const fss = createMockFileSystemService({
      openDirectoryDialog: vi.fn().mockResolvedValue(null),
    });

    const result = await openFolderAction(fss);

    expect(result).toBeNull();
  });
});
