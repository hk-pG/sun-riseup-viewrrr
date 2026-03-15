import { describe, expect, it, vi } from 'vitest';
import type { FileSystemService } from '@/features/folder-navigation/services/FileSystemService';
import { openFolderAction } from '../openFolderAction';

function createMockFss(dialogResult: string | null = null): FileSystemService {
  return {
    openDirectoryDialog: vi.fn().mockResolvedValue(dialogResult),
  } as unknown as FileSystemService;
}

describe('openFolderAction', () => {
  it('フォルダ選択成功時: FolderSelectedResult を返す', async () => {
    const fss = createMockFss('/some/folder');

    const result = await openFolderAction(fss);

    expect(result).toEqual({
      type: 'folder-selected',
      folderPath: '/some/folder',
      initialImageIndex: 0,
    });
  });

  it('フォルダ選択成功時: initialImageIndex は常に 0', async () => {
    const fss = createMockFss('/another/folder');

    const result = await openFolderAction(fss);

    expect(result?.initialImageIndex).toBe(0);
  });

  it('キャンセル時（null）: null を返す', async () => {
    const fss = createMockFss(null);

    const result = await openFolderAction(fss);

    expect(result).toBeNull();
  });
});
