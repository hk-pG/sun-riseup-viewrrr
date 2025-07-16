import { useOpenImageFile } from '@/components/hooks/useOpenImageFile';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockFs = {
  openDirectoryDialog: vi.fn(),
  openImageFileDialog: vi.fn(),
  getBaseName: vi.fn(),
  getDirName: vi.fn(),
  listImagesInFolder: vi.fn(),
  getSiblingFolders: vi.fn(),
  convertFileSrc: vi.fn(),
};

describe('useOpenImageFile', () => {
  it('画像ファイルを選択したとき、そのファイルのあるディレクトリを開き、インデックスを合わせる', async () => {
    mockFs.openImageFileDialog.mockResolvedValue('/foo/bar/image2.png');
    mockFs.getDirName.mockResolvedValue('/foo/bar');
    mockFs.listImagesInFolder.mockResolvedValue([
      '/foo/bar/image1.png',
      '/foo/bar/image2.png',
      '/foo/bar/image3.png',
    ]);
    const { result } = renderHook(() => useOpenImageFile(mockFs));
    const res = await result.current.openImageFile();
    expect(res).toEqual({
      folderPath: '/foo/bar',
      filePath: '/foo/bar/image2.png',
      index: 1,
    });
  });

  it('非画像ファイルを選択した場合は何も起きない', async () => {
    mockFs.openImageFileDialog.mockResolvedValue(null);
    const { result } = renderHook(() => useOpenImageFile(mockFs));
    const res = await result.current.openImageFile();
    expect(res).toBeNull();
  });

  it('画像リストが空の場合、インデックスは0', async () => {
    mockFs.openImageFileDialog.mockResolvedValue('/foo/bar/image2.png');
    mockFs.getDirName.mockResolvedValue('/foo/bar');
    mockFs.listImagesInFolder.mockResolvedValue([]);
    const { result } = renderHook(() => useOpenImageFile(mockFs));
    const res = await result.current.openImageFile();
    expect(res).toEqual({
      folderPath: '/foo/bar',
      filePath: '/foo/bar/image2.png',
      index: 0,
    });
  });
});
