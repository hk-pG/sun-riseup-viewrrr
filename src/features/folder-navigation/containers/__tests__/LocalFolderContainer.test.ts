import { describe, expect, it, vi } from 'vitest';
import { createMockFileSystemService } from '@/test/mocks';
import { LocalFolderContainer } from '../LocalFolderContainer';

describe('LocalFolderContainer', () => {
  it('listHandles は index 昇順で返す', async () => {
    const mockFs = createMockFileSystemService({
      listImageHandles: vi.fn().mockResolvedValue([
        { index: 2, name: 'image3.png' },
        { index: 0, name: 'image1.png' },
        { index: 1, name: 'image2.png' },
      ]),
    });
    const container = new LocalFolderContainer('/foo/bar', mockFs);

    await expect(container.listHandles()).resolves.toEqual([
      { index: 0, name: 'image1.png' },
      { index: 1, name: 'image2.png' },
      { index: 2, name: 'image3.png' },
    ]);
    expect(mockFs.listImageHandles).toHaveBeenCalledWith('/foo/bar');
  });

  it('resolveRange は handle の index 順で ImageSource を組み立てる', async () => {
    const mockFs = createMockFileSystemService({
      listImageHandles: vi.fn().mockResolvedValue([
        { index: 1, name: 'image2.png' },
        { index: 0, name: 'image1.png' },
        { index: 2, name: 'image3.png' },
      ]),
      resolveImagesInRange: vi
        .fn()
        .mockResolvedValue(['/foo/bar/image1.png', '/foo/bar/image2.png']),
    });
    const container = new LocalFolderContainer('/foo/bar', mockFs);

    await expect(container.resolveRange(0, 2)).resolves.toEqual([
      {
        id: '/foo/bar/image1.png',
        name: 'image1.png',
        assetUrl: 'asset:///foo/bar/image1.png',
      },
      {
        id: '/foo/bar/image2.png',
        name: 'image2.png',
        assetUrl: 'asset:///foo/bar/image2.png',
      },
    ]);
    expect(mockFs.resolveImagesInRange).toHaveBeenCalledWith('/foo/bar', 0, 2);
  });

  it('listImages は新 API を chunkSize ごとに呼んで旧契約を維持する', async () => {
    const imagePaths = [
      '/foo/bar/image1.png',
      '/foo/bar/image2.png',
      '/foo/bar/image3.png',
    ];
    const mockFs = createMockFileSystemService({
      listImageHandles: vi.fn().mockResolvedValue([
        { index: 0, name: 'image1.png' },
        { index: 1, name: 'image2.png' },
        { index: 2, name: 'image3.png' },
      ]),
      resolveImagesInRange: vi
        .fn()
        .mockImplementation(
          async (_containerPath, offset: number, count: number) =>
            imagePaths.slice(offset, offset + count),
        ),
    });
    const container = new LocalFolderContainer('/foo/bar', mockFs, {
      chunkSize: 2,
    });

    await expect(container.listImages()).resolves.toEqual([
      {
        id: '/foo/bar/image1.png',
        name: 'image1.png',
        assetUrl: 'asset:///foo/bar/image1.png',
      },
      {
        id: '/foo/bar/image2.png',
        name: 'image2.png',
        assetUrl: 'asset:///foo/bar/image2.png',
      },
      {
        id: '/foo/bar/image3.png',
        name: 'image3.png',
        assetUrl: 'asset:///foo/bar/image3.png',
      },
    ]);
    expect(mockFs.resolveImagesInRange).toHaveBeenNthCalledWith(
      1,
      '/foo/bar',
      0,
      2,
    );
    expect(mockFs.resolveImagesInRange).toHaveBeenNthCalledWith(
      2,
      '/foo/bar',
      2,
      1,
    );
    expect(mockFs.listImagesInContainer).not.toHaveBeenCalled();
  });
});
