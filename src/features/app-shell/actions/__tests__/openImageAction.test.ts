import { describe, expect, it, vi } from 'vitest';
import { openImageAction } from '../openImageAction';

describe('openImageAction', () => {
  it('画像選択成功時: FolderSelectedResult を返す', async () => {
    const openImageFile = vi.fn().mockResolvedValue({
      folderPath: '/images/photos',
      filePath: '/images/photos/img.jpg',
      index: 7,
    });

    const result = await openImageAction(openImageFile);

    expect(result).toEqual({
      type: 'folder-selected',
      folderPath: '/images/photos',
      initialImageIndex: 7,
    });
  });

  it('openImageFile が null を返した場合: null を返す', async () => {
    const openImageFile = vi.fn().mockResolvedValue(null);

    const result = await openImageAction(openImageFile);

    expect(result).toBeNull();
  });

  it('folderPath が空文字の場合: null を返す', async () => {
    const openImageFile = vi.fn().mockResolvedValue({
      folderPath: '',
      filePath: null,
      index: 0,
    });

    const result = await openImageAction(openImageFile);

    expect(result).toBeNull();
  });
});
