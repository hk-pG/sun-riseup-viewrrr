import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileSystemService } from '@/features/folder-navigation';
import type { ImageSource } from '@/features/image-viewer';
import { ServicesProvider, useImages } from '@/shared';

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

// Tauri APIのモック
const mockFileSystemService: FileSystemService = {
  getBaseName: vi.fn(async (filePath: string) => {
    const foundMock = mockImageSources.find((img) => img.id === filePath);
    return foundMock ? foundMock.name : 'unknown';
  }),
  getDirName: vi.fn(),
  openDirectoryDialog: vi.fn(),
  listImagesInFolder: vi.fn(),
  getSiblingFolders: vi.fn(),
  convertFileSrc: vi.fn((filePath: string) => {
    const foundMock = mockImageSources.find((img) => img.id === filePath);
    return foundMock ? foundMock.assetUrl : 'asset://unknown';
  }),
  openImageFileDialog: vi.fn(),
};

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
  });

  it('存在するフォルダ内の画像リストを取得する', async () => {
    mockFileSystemService.listImagesInFolder = vi
      .fn()
      .mockResolvedValue([mockImageSources[0].id, mockImageSources[1].id]);

    const { result } = renderHook(() => useImages('path/to/'), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.images).toEqual(mockImageSources);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('存在しないフォルダを指定した場合、空の配列を返す', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFileSystemService.listImagesInFolder = vi.fn().mockReturnValue(null);

    const { result } = renderHook(() => useImages('invalid/folder'), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.images).toEqual([]);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('ファイルアクセスで例外が発生した場合、空の配列を返す', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFileSystemService.listImagesInFolder = vi
      .fn()
      .mockRejectedValue(new Error('File access error'));
    const { result } = renderHook(() => useImages('error/folder'), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.images).toEqual([]);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('画像が1件も存在しないフォルダの場合、空配列を返す', async () => {
    mockFileSystemService.listImagesInFolder = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() => useImages('empty/folder'), {
      wrapper: ServicesWrapper,
    });
    await waitFor(() => {
      expect(result.current.images).toEqual([]);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('folderPathがnullの場合、imagesはundefinedになる', async () => {
    // listImagesInFolderは呼ばれないはず
    mockFileSystemService.listImagesInFolder = vi.fn();
    const { result } = renderHook(() => useImages(null), {
      wrapper: ServicesWrapper,
    });
    expect(result.current.images).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockFileSystemService.listImagesInFolder).not.toHaveBeenCalled();
  });

  it('folderPathがundefinedの場合、imagesはundefinedになる', async () => {
    mockFileSystemService.listImagesInFolder = vi.fn();
    const { result } = renderHook(() => useImages(undefined), {
      wrapper: ServicesWrapper,
    });
    expect(result.current.images).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockFileSystemService.listImagesInFolder).not.toHaveBeenCalled();
  });

  it('同じパスで2回呼んだ場合、SWRキャッシュによりlistImagesInFolderが1回しか呼ばれない', async () => {
    const spy = vi.fn().mockResolvedValue([mockImageSources[0].id]);
    mockFileSystemService.listImagesInFolder = spy;

    const { result: result1 } = renderHook(() => useImages('cache/folder'), {
      wrapper: ServicesWrapper,
    });
    await waitFor(() => {
      expect(result1.current.images).toEqual([mockImageSources[0]]);
    });

    // 2回目（キャッシュが効いていればlistImagesInFolderは呼ばれない）
    const { result: result2 } = renderHook(() => useImages('cache/folder'), {
      wrapper: ServicesWrapper,
    });
    await waitFor(() => {
      expect(result2.current.images).toEqual([mockImageSources[0]]);
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // 改善点: beforeEachでconsole.errorのモックをリセットする
  afterEach(() => {
    vi.restoreAllMocks();
  });
});
