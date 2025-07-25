import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FolderInfo } from '@/types/viewerTypes';
import { FolderView } from './FolderView';
import { useThumbnail } from './hooks/useThumbnail';

// useThumbnailのモック
vi.mock('./hooks/useThumbnail', () => ({
  useThumbnail: vi.fn(),
}));

describe('FolderView', () => {
  const mockFolder: FolderInfo = {
    path: '/test/folder',
    name: 'Test Folder',
    imageCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('フォルダ名を表示する', () => {
    vi.mocked(useThumbnail).mockReturnValue({
      thumbnail: null,
      isLoading: false,
      isError: false,
    });
    render(<FolderView folder={mockFolder} onClick={() => {}} />);
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
  });

  it('画像枚数を表示する', () => {
    vi.mocked(useThumbnail).mockReturnValue({
      thumbnail: null,
      isLoading: false,
      isError: false,
    });

    render(
      <FolderView
        folder={mockFolder}
        onClick={() => {}}
        showImageCount={true}
      />,
    );

    expect(screen.getByText('5枚')).toBeInTheDocument();
  });

  it('ローディング中はスケルトンを表示する', () => {
    vi.mocked(useThumbnail).mockReturnValue({
      thumbnail: null,
      isLoading: true,
      isError: false,
    });

    render(<FolderView folder={mockFolder} onClick={() => {}} />);

    expect(screen.getByTestId('thumbnail-loading')).toBeInTheDocument();
  });

  it('サムネイルが取得できたら画像を表示する', () => {
    const mockThumbnail = {
      id: '/test/folder/image1.jpg',
      name: 'image1.jpg',
      assetUrl: 'converted/image1.jpg',
    };

    vi.mocked(useThumbnail).mockReturnValue({
      thumbnail: mockThumbnail,
      isLoading: false,
      isError: false,
    });

    render(<FolderView folder={mockFolder} onClick={() => {}} />);

    const image = screen.getByAltText(`${mockFolder.name}のサムネイル`);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockThumbnail.assetUrl);
  });

  it('サムネイルが取得できない場合はフォルダアイコンを表示する', () => {
    vi.mocked(useThumbnail).mockReturnValue({
      thumbnail: null,
      isLoading: false,
      isError: false,
    });

    render(<FolderView folder={mockFolder} onClick={() => {}} />);

    expect(screen.getByText('📁')).toBeInTheDocument();
  });
});
