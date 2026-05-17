import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMockFileSystemService } from '@/test/mocks';
import { useOpenImageFile } from '../useOpenImageFile';

describe('useOpenImageFile', () => {
  it('画像ファイルを選択したとき、そのファイルのあるディレクトリを開き、インデックスを合わせる', async () => {
    const mockFs = createMockFileSystemService({
      openImageFileDialog: vi.fn().mockResolvedValue('/foo/bar/image2.png'),
      getDirName: vi.fn().mockResolvedValue('/foo/bar'),
      listImagesInFolder: vi
        .fn()
        .mockResolvedValue([
          '/foo/bar/image1.png',
          '/foo/bar/image2.png',
          '/foo/bar/image3.png',
        ]),
    });
    const { result } = renderHook(() => useOpenImageFile(mockFs));
    const res = await result.current.openImageFile();
    expect(res).toEqual({
      folderPath: '/foo/bar',
      filePath: '/foo/bar/image2.png',
      index: 1,
    });
  });

  it('非画像ファイルを選択した場合は何も起きない', async () => {
    const mockFs = createMockFileSystemService({
      openImageFileDialog: vi.fn().mockResolvedValue(null),
    });
    const { result } = renderHook(() => useOpenImageFile(mockFs));
    const res = await result.current.openImageFile();
    expect(res).toBeNull();
  });

  it('画像リストが空の場合、インデックスは0', async () => {
    const mockFs = createMockFileSystemService({
      openImageFileDialog: vi.fn().mockResolvedValue('/foo/bar/image2.png'),
      getDirName: vi.fn().mockResolvedValue('/foo/bar'),
      listImagesInFolder: vi.fn().mockResolvedValue([]),
    });
    const { result } = renderHook(() => useOpenImageFile(mockFs));
    const res = await result.current.openImageFile();
    expect(res).toEqual({
      folderPath: '/foo/bar',
      filePath: '/foo/bar/image2.png',
      index: 0,
    });
  });
});
