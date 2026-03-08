import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useThumbnail } from '@/features/folder-navigation/hooks/useThumbnail';
import type { FolderInfo } from '@/features/folder-navigation/types/folderTypes';
import { FolderList } from '../FolderList';

vi.mock('@/features/folder-navigation/hooks/useThumbnail', () => ({
  useThumbnail: vi.fn(),
}));

const mockThumbnailIdle = () => {
  vi.mocked(useThumbnail).mockReturnValue({
    thumbnail: null,
    isLoading: false,
    isError: false,
  });
};

describe('初期表示', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThumbnailIdle();
  });

  // TODO: 状態の変更がある場合はactでラップする必要がある場合がある
  it('フォルダが渡されなければ何も表示しないこと', async () => {
    render(
      <FolderList
        data-testid="folder-list"
        folders={[]}
        onFolderSelect={vi.fn()}
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('フォルダが1つ渡されたら1つ表示すること', async () => {
    const folders: FolderInfo[] = [
      {
        name: 'Folder 1',
        path: '/path/to/folder1',
        imageCount: 1,
        thumbnailImage: {
          name: 'thumb1.jpg',
          path: '/path/to/folder1/thumb1.jpg',
        },
      },
    ];

    render(<FolderList folders={folders} onFolderSelect={vi.fn()} />);

    expect(screen.getByText('Folder 1')).toBeInTheDocument();
  });

  it('フォルダが複数渡されたらすべて表示すること', () => {
    const folders: FolderInfo[] = [
      { name: 'Folder 1', path: '/path/to/folder1', imageCount: 1 },
      { name: 'Folder 2', path: '/path/to/folder2', imageCount: 2 },
      { name: 'Folder 3', path: '/path/to/folder3', imageCount: 3 },
    ];

    render(<FolderList folders={folders} onFolderSelect={vi.fn()} />);

    expect(screen.getByText('Folder 1')).toBeInTheDocument();
    expect(screen.getByText('Folder 2')).toBeInTheDocument();
    expect(screen.getByText('Folder 3')).toBeInTheDocument();
    expect(screen.getAllByText('Folder', { exact: false })).toHaveLength(3);
  });
});

describe('クリック操作', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThumbnailIdle();
  });

  it('フォルダをクリックしたとき onFolderSelect が1回呼ばれること', () => {
    const onFolderSelect = vi.fn();
    const folders: FolderInfo[] = [
      { name: 'Folder 1', path: '/path/to/folder1', imageCount: 1 },
    ];

    render(<FolderList folders={folders} onFolderSelect={onFolderSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Folder 1/ }));

    expect(onFolderSelect).toHaveBeenCalledOnce();
  });

  it('クリックしたフォルダの FolderInfo が引数として渡されること', () => {
    const onFolderSelect = vi.fn();
    const folder: FolderInfo = {
      name: 'Folder 1',
      path: '/path/to/folder1',
      imageCount: 1,
    };

    render(<FolderList folders={[folder]} onFolderSelect={onFolderSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Folder 1/ }));

    expect(onFolderSelect).toHaveBeenCalledWith(folder);
  });

  it('複数フォルダのうち Folder 2 をクリックしたとき Folder 2 の情報が渡されること', () => {
    const onFolderSelect = vi.fn();
    const folders: FolderInfo[] = [
      { name: 'Folder 1', path: '/path/to/folder1', imageCount: 1 },
      { name: 'Folder 2', path: '/path/to/folder2', imageCount: 2 },
    ];

    render(<FolderList folders={folders} onFolderSelect={onFolderSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Folder 2/ }));

    expect(onFolderSelect).toHaveBeenCalledWith(folders[1]);
  });
});

describe('ダブルクリック操作', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThumbnailIdle();
  });

  it('onFolderDoubleClick が渡された場合、ダブルクリックで対象フォルダの情報が渡されること', () => {
    const onFolderDoubleClick = vi.fn();
    const folder: FolderInfo = {
      name: 'Folder 1',
      path: '/path/to/folder1',
      imageCount: 1,
    };

    render(
      <FolderList
        folders={[folder]}
        onFolderSelect={vi.fn()}
        onFolderDoubleClick={onFolderDoubleClick}
      />,
    );
    fireEvent.dblClick(screen.getByRole('button', { name: /Folder 1/ }));

    expect(onFolderDoubleClick).toHaveBeenCalledWith(folder);
  });

  it('onFolderDoubleClick が渡されていない場合、ダブルクリックしてもエラーにならないこと', () => {
    const folder: FolderInfo = {
      name: 'Folder 1',
      path: '/path/to/folder1',
      imageCount: 1,
    };

    expect(() => {
      render(<FolderList folders={[folder]} onFolderSelect={vi.fn()} />);
      fireEvent.dblClick(screen.getByRole('button', { name: /Folder 1/ }));
    }).not.toThrow();
  });
});

describe('選択状態', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThumbnailIdle();
  });

  it('selectedFolder に一致するフォルダが aria-pressed=true になること', () => {
    const folders: FolderInfo[] = [
      { name: 'Folder 1', path: '/path/to/folder1', imageCount: 1 },
      { name: 'Folder 2', path: '/path/to/folder2', imageCount: 2 },
    ];

    render(
      <FolderList
        folders={folders}
        selectedFolder={folders[0]}
        onFolderSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Folder 1/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Folder 2/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('selectedFolder が未指定の場合、すべてのフォルダが aria-pressed=false になること', () => {
    const folders: FolderInfo[] = [
      { name: 'Folder 1', path: '/path/to/folder1', imageCount: 1 },
      { name: 'Folder 2', path: '/path/to/folder2', imageCount: 2 },
    ];

    render(<FolderList folders={folders} onFolderSelect={vi.fn()} />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
  });
});
