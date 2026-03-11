import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServicesProvider } from '../../../../shared/context/ServiceContext';
import type { FileSystemService } from '../../services/FileSystemService';
import type { FolderInfo } from '../../types/folderTypes';
import { useThumbnailPrefetch } from '../useThumbnailPrefetch';

// --- ヘルパー ---

function createWrapper(service: Partial<FileSystemService>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ServicesProvider services={service as FileSystemService}>
        {children}
      </ServicesProvider>
    );
  };
}

// --- テストデータ ---

const mockFolders: FolderInfo[] = [
  { path: '/photos/folder1', name: 'folder1' },
  { path: '/photos/folder2', name: 'folder2' },
  { path: '/photos/folder3', name: 'folder3' },
];

// --- テストスイート ---

describe('useThumbnailPrefetch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // テスト1: 新API経由でプリフェッチ
  it('新APIが利用可能な場合、全フォルダパスをprefetchFolderThumbnailsに渡す', async () => {
    const mockService: Partial<FileSystemService> = {
      prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
      convertFileSrc: (path: string) => `asset://${path}`,
    };

    renderHook(() => useThumbnailPrefetch(mockFolders, { delay: 0 }), {
      wrapper: createWrapper(mockService),
    });

    // useEffect + setTimeout の実行を待つ
    await vi.advanceTimersByTimeAsync(0);

    expect(mockService.prefetchFolderThumbnails).toHaveBeenCalledWith([
      '/photos/folder1',
      '/photos/folder2',
      '/photos/folder3',
    ]);
  });

  // テスト2: 空のフォルダリスト
  it('フォルダが0件の場合、プリフェッチAPIを呼ばない', async () => {
    const mockService: Partial<FileSystemService> = {
      prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
      convertFileSrc: (path: string) => `asset://${path}`,
    };

    renderHook(() => useThumbnailPrefetch([], { delay: 0 }), {
      wrapper: createWrapper(mockService),
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(mockService.prefetchFolderThumbnails).not.toHaveBeenCalled();
  });

  // テスト3: disabled時は呼ばない
  it('disabled: trueの場合、プリフェッチを実行しない', async () => {
    const mockService: Partial<FileSystemService> = {
      prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
      convertFileSrc: (path: string) => `asset://${path}`,
    };

    renderHook(
      () => useThumbnailPrefetch(mockFolders, { disabled: true, delay: 0 }),
      { wrapper: createWrapper(mockService) },
    );

    await vi.advanceTimersByTimeAsync(0);

    expect(mockService.prefetchFolderThumbnails).not.toHaveBeenCalled();
  });
});
