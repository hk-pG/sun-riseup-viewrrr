import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalFolderContainer } from '@/features/folder-navigation';
import type { FileSystemService } from '@/features/folder-navigation/services/FileSystemService';
import type { ImageContainer, ImageSource } from '@/features/image-viewer';
import { ServicesProvider, useImages } from '@/shared';
import { createMockFileSystemService } from '../../../../test/mocks';

// モックデータ
const mockImageSources: ImageSource[] = [
  {
    id: '/path/to/image1.jpg',
    name: 'image1.jpg',
    assetUrl: 'asset://path/to/image1.jpg',
  },
  {
    id: '/path/to/image2.png',
    name: 'image2.png',
    assetUrl: 'asset://path/to/image2.png',
  },
];

// Tauri APIのモック（beforeEach内で再生成）
let mockFileSystemService: FileSystemService;

const createImageHandles = () =>
  mockImageSources.map((image, index) => ({
    index,
    name: image.name,
  }));

const ServicesWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ServicesProvider services={mockFileSystemService}>
      {children}
    </ServicesProvider>
  );
};

describe('useImages', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFileSystemService = createMockFileSystemService({
      getBaseName: vi.fn(async (filePath: string) => {
        const foundMock = mockImageSources.find((img) => img.id === filePath);
        return foundMock ? foundMock.name : 'unknown';
      }),
      convertFileSrc: vi.fn((filePath: string) => {
        const foundMock = mockImageSources.find((img) => img.id === filePath);
        return foundMock ? foundMock.assetUrl : 'asset://unknown';
      }),
    });
  });

  it('存在するフォルダ内の画像リストを取得する', async () => {
    mockFileSystemService.listImageHandles = vi
      .fn()
      .mockResolvedValue(createImageHandles());
    mockFileSystemService.resolveImagesInRange = vi
      .fn()
      .mockResolvedValue([mockImageSources[0].id, mockImageSources[1].id]);

    const { result } = renderHook(
      () =>
        useImages(
          new LocalFolderContainer('/path/to/folder', mockFileSystemService),
        ),
      {
        wrapper: ServicesWrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.images).toEqual(mockImageSources);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('ファイルアクセスで例外が発生した場合、エラーが返される', async () => {
    mockFileSystemService.listImageHandles = vi
      .fn()
      .mockRejectedValue(new Error('File access error'));
    const { result } = renderHook(
      () =>
        useImages(
          new LocalFolderContainer('error/folder', mockFileSystemService),
        ),
      {
        wrapper: ServicesWrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.images).toBeUndefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('画像が1件も存在しないフォルダの場合、空配列を返す', async () => {
    mockFileSystemService.listImageHandles = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(
      () =>
        useImages(
          new LocalFolderContainer('empty/folder', mockFileSystemService),
        ),
      {
        wrapper: ServicesWrapper,
      },
    );
    await waitFor(() => {
      expect(result.current.images).toEqual([]);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('folderPathがundefinedの場合、imagesはundefinedになる', async () => {
    mockFileSystemService.listImageHandles = vi.fn();
    const { result } = renderHook(() => useImages(undefined), {
      wrapper: ServicesWrapper,
    });
    expect(result.current.images).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockFileSystemService.listImageHandles).not.toHaveBeenCalled();
  });

  it('同じパスで2回呼んだ場合、SWRキャッシュによりlistImageHandlesが1回しか呼ばれない', async () => {
    const handlesSpy = vi
      .fn()
      .mockResolvedValue([{ index: 0, name: mockImageSources[0].name }]);
    const resolveSpy = vi.fn().mockResolvedValue([mockImageSources[0].id]);
    mockFileSystemService.listImageHandles = handlesSpy;
    mockFileSystemService.resolveImagesInRange = resolveSpy;

    const { result: result1 } = renderHook(
      () =>
        useImages(
          new LocalFolderContainer('cache/folder', mockFileSystemService),
        ),
      {
        wrapper: ServicesWrapper,
      },
    );
    await waitFor(() => {
      expect(result1.current.images).toEqual([mockImageSources[0]]);
    });

    const { result: result2 } = renderHook(
      () =>
        useImages(
          new LocalFolderContainer('cache/folder', mockFileSystemService),
        ),
      {
        wrapper: ServicesWrapper,
      },
    );
    await waitFor(() => {
      expect(result2.current.images).toEqual([mockImageSources[0]]);
    });
    expect(handlesSpy).toHaveBeenCalledTimes(1);
    expect(resolveSpy).toHaveBeenCalledTimes(1);
  });

  it('container を渡した場合は新契約の listHandles と resolveRange を使う', async () => {
    const listHandles = vi
      .fn()
      .mockResolvedValue([{ index: 0, name: mockImageSources[0].name }]);
    const resolveRange = vi.fn().mockResolvedValue([mockImageSources[0]]);
    const container: ImageContainer = {
      getCacheKey: () => 'container:/images',
      listHandles,
      resolveRange,
    };

    const { result } = renderHook(() => useImages(container), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.images).toEqual([mockImageSources[0]]);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    expect(listHandles).toHaveBeenCalledTimes(1);
    expect(resolveRange).toHaveBeenCalledWith(0, 1);
    expect(mockFileSystemService.listImageHandles).not.toHaveBeenCalled();
  });

  // 改善点: beforeEachでconsole.errorのモックをリセットする
  afterEach(() => {
    vi.restoreAllMocks();
  });
});
