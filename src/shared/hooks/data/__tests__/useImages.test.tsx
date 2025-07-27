import { renderHook } from '@testing-library/react';
import useSWR, { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { FileSystemService } from '../../../../features/folder-navigation';
import type { ImageSource } from '../../../../features/image-viewer/types/ImageSource';
import { ServicesProvider } from '../../../context/ServiceContext';
import { useImages } from '../useImages';

// useSWR をモックする
vi.mock('swr', () => ({
  default: vi.fn(),
  SWRConfig: ({ children }: { children: React.ReactNode }) => children,
}));

const mockImages: ImageSource[] = [
  { id: 'a.png', name: 'a.png', assetUrl: 'a.png' },
  { id: 'b.png', name: 'b.png', assetUrl: 'b.png' },
];

const mockFileSystemService: Partial<FileSystemService> = {
  listImagesInFolder: async (folderPath: string) => {
    if (folderPath === 'path/with/images') {
      return mockImages.map((img) => img.id);
    }
    if (folderPath === 'path/with/error') {
      throw new Error('Failed to read directory');
    }
    return [];
  },
  getBaseName: async (p: string) => p,
  convertFileSrc: (p: string) => p,
};

// @ts-ignore
const wrapper = ({ children }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    <ServicesProvider services={mockFileSystemService}>
      {children}
    </ServicesProvider>
  </SWRConfig>
);

describe('useImages', () => {
  beforeEach(() => {
    // 各テストの前に useSWR のモックをリセット
    (useSWR as Mock).mockReset();
  });

  it('指定したフォルダの画像リストを正しく取得すること', async () => {
    // useSWR が成功を返すようにモック
    (useSWR as Mock).mockReturnValue({
      data: mockImages,
      error: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useImages('path/with/images'), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.images).toEqual(mockImages);
    expect(result.current.error).toBeUndefined();
  });

  it('フォルダパスがnullの場合はデータを取得しないこと', () => {
    // useSWR がデータを返さないようにモック
    (useSWR as Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useImages(null), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.images).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('データ取得でエラーが発生した場合にerror状態が設定されること', async () => {
    const mockError = new Error('Failed to read directory');
    // useSWR がエラーを返すようにモック
    (useSWR as Mock).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
    });

    const { result } = renderHook(() => useImages('path/with/error'), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.images).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('Failed to read directory');
  });
});
