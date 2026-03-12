import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { describe, expect, it, vi } from 'vitest';
import { ServicesProvider } from '../../../../shared/context/ServiceContext';
import type { FileSystemService } from '../../services/FileSystemService';
import { useThumbnail } from '../useThumbnail';

// --- ヘルパー ---

/**
 * SWRキャッシュ分離 + ServiceContext を提供するラッパー
 */
function createWrapper(service: Partial<FileSystemService>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        <ServicesProvider services={service as FileSystemService}>
          {children}
        </ServicesProvider>
      </SWRConfig>
    );
  };
}

// --- テストスイート ---

describe('useThumbnail', () => {
  // テスト1: 新API(getFolderThumbnail)経由でサムネイル取得
  it('新APIが利用可能な場合、getFolderThumbnailで1回のIPCでサムネイルを取得する', async () => {
    const mockService: Partial<FileSystemService> = {
      getFolderThumbnail: vi.fn().mockResolvedValue({
        imagePath: '/photos/folder1/image1.jpg',
        thumbnailPath: '/cache/thumbnails/abc123.jpg',
        imageName: 'image1.jpg',
      }),
      listImagesInFolder: vi.fn(),
      convertFileSrc: (path: string) => `asset://${path}`,
    };

    const { result } = renderHook(() => useThumbnail('/photos/folder1'), {
      wrapper: createWrapper(mockService),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.thumbnail).toEqual({
      id: '/photos/folder1/image1.jpg',
      name: 'image1.jpg',
      assetUrl: 'asset:///cache/thumbnails/abc123.jpg',
    });
    expect(mockService.getFolderThumbnail).toHaveBeenCalledWith(
      '/photos/folder1',
    );
    // 旧APIは呼ばれない（新APIで1回のIPCで完結）
    expect(mockService.listImagesInFolder).not.toHaveBeenCalled();
  });

  // テスト2: 画像なしフォルダ
  it('画像がないフォルダの場合、nullを返す', async () => {
    const mockService: Partial<FileSystemService> = {
      getFolderThumbnail: vi.fn().mockResolvedValue(null),
      convertFileSrc: (path: string) => `asset://${path}`,
    };

    const { result } = renderHook(() => useThumbnail('/photos/empty-folder'), {
      wrapper: createWrapper(mockService),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.thumbnail).toBeNull();
  });

  // テスト4: ローディング状態
  it('サムネイル取得中はisLoadingがtrueを返す', () => {
    const mockService: Partial<FileSystemService> = {
      getFolderThumbnail: vi.fn().mockImplementation(
        () => new Promise(() => {}), // 永遠にpending
      ),
      convertFileSrc: (path: string) => `asset://${path}`,
    };

    const { result } = renderHook(() => useThumbnail('/photos/folder1'), {
      wrapper: createWrapper(mockService),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
