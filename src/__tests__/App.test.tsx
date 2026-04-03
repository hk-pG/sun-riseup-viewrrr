import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppMenuBarProps } from '@/features/app-shell';
import type { SidebarProps } from '@/features/folder-navigation';
import type { ImageViewerProps } from '@/features/image-viewer';
import App from '../App';
import { ThemeProvider } from '../components/theme-provider';
import type { FileSystemService } from '../features/folder-navigation/services/FileSystemService';
import { ServicesProvider } from '../shared/context/ServiceContext';
import { resetAllMocks, setupTauriMocks } from '../test/mocks';

// テストで制御可能なモック関数
const mockOpenImageFile = vi.fn();

// 機能コンポーネントのモック
// 実コンポーネントと同じセマンティクス（role, aria属性）を使用し、data-testidに依存しない
vi.mock('../features/app-shell', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../features/app-shell')>();
  return {
    ...actual,
    AppMenuBar: ({ onMenuAction, isDraggable }: AppMenuBarProps) => (
      <header data-tauri-drag-region={isDraggable ? 'true' : undefined}>
        <button type="button" onClick={() => onMenuAction('open-folder')}>
          フォルダを開く
        </button>
        <button type="button" onClick={() => onMenuAction('open-image')}>
          画像ファイルを開く
        </button>
      </header>
    ),
  };
});

vi.mock('../features/folder-navigation', () => ({
  Sidebar: ({ folders, selectedFolder, onFolderSelect }: SidebarProps) => (
    <aside>
      {folders.map((folder: { path: string; name: string }) => (
        <button
          type="button"
          key={folder.path}
          aria-pressed={selectedFolder?.path === folder.path}
          onClick={() => onFolderSelect(folder)}
        >
          {folder.name}
        </button>
      ))}
    </aside>
  ),
  // useOpenImageFileフックのモック
  useOpenImageFile: () => ({
    openImageFile: mockOpenImageFile,
  }),
  // useSiblingFoldersフックのモック（固定値を返す）
  useSiblingFolders: () => ({
    entries: [
      { name: 'folder1', path: '/test/folder1' },
      { name: 'folder2', path: '/test/folder2' },
    ],
  }),
}));

vi.mock('../features/image-viewer', () => ({
  ImageViewer: ({ folderPath, initialIndex, className }: ImageViewerProps) => (
    <section className={className} aria-label="image-viewer">
      {folderPath ? `表示中: ${folderPath}` : '画像が選択されていません'}
      {folderPath && initialIndex != null && initialIndex > 0 && (
        <span>{`開始位置: ${initialIndex}`}</span>
      )}
    </section>
  ),
}));

const createMockFileSystemService = (): FileSystemService => ({
  openDirectoryDialog: vi.fn(),
  getBaseName: vi.fn(),
  getDirName: vi.fn(),
  listImagesInFolder: vi.fn(),
  getSiblingFolders: vi.fn(),
  convertFileSrc: vi.fn(),
  getFolderThumbnail: vi.fn().mockResolvedValue(null),
  prefetchFolderThumbnails: vi.fn().mockResolvedValue(undefined),
});

describe('App Component', () => {
  let mockFileSystemService: ReturnType<typeof createMockFileSystemService>;

  beforeEach(() => {
    resetAllMocks();
    setupTauriMocks();
    mockFileSystemService = createMockFileSystemService();
    mockOpenImageFile.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const renderApp = (services?: Partial<FileSystemService>) => {
    return render(
      <ThemeProvider>
        <ServicesProvider services={services}>
          <App />
        </ServicesProvider>
        ,
      </ThemeProvider>,
    );
  };

  describe('Component Rendering and Initialization', () => {
    it('should render without errors', () => {
      renderApp();

      // 各セマンティック要素が正しくレンダリングされていることを確認
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();
    });

    it('should initialize with empty folder path', () => {
      renderApp();

      // 初期状態では画像が選択されていないテキストが表示される
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();
    });

    it('should set menu bar as draggable', () => {
      renderApp();

      const menuBar = screen.getByRole('banner');
      // INFO: UIに関する設定だが、フレームレスのため確実にdata-tauri-drag-region属性が設定されている必要がある
      expect(menuBar).toHaveAttribute('data-tauri-drag-region', 'true');
    });
  });

  describe('Folder Selection Event Handling', () => {
    it('should handle open-folder menu action', async () => {
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
        '/selected/folder',
      );
      renderApp(mockFileSystemService);

      fireEvent.click(screen.getByRole('button', { name: 'フォルダを開く' }));

      await waitFor(() => {
        expect(mockFileSystemService.openDirectoryDialog).toHaveBeenCalled();
      });

      await waitFor(() => {
        // モックのImageViewerに選択されたフォルダパスがテキストとして表示されることを確認
        expect(
          screen.getByText('表示中: /selected/folder'),
        ).toBeInTheDocument();
      });
    });

    // open-folderボタン押下後、ダイアログがnullを返す（キャンセル）場合に状態が変化しないことを検証
    it('should not update folder path when dialog is cancelled', async () => {
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
        null,
      );
      renderApp(mockFileSystemService);

      fireEvent.click(screen.getByRole('button', { name: 'フォルダを開く' }));

      await waitFor(() => {
        expect(mockFileSystemService.openDirectoryDialog).toHaveBeenCalled();
      });

      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();
    });

    it('should handle folder selection from sidebar', () => {
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: 'folder1' }));

      // useSiblingFoldersのモックが固定値を返すため、
      // その内の1つが選択された場合にImageViewer側に選択値が反映されることを確認
      expect(screen.getByText('表示中: /test/folder1')).toBeInTheDocument();
    });

    it('should update selected folder in sidebar', () => {
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: 'folder1' }));

      expect(screen.getByRole('button', { name: 'folder1' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  describe('Image File Opening Event Handling', () => {
    it('should handle open-image menu action with successful result', async () => {
      vi.mocked(mockOpenImageFile).mockResolvedValue({
        folderPath: '/image/folder',
        index: 2,
      });

      renderApp(mockFileSystemService);

      fireEvent.click(
        screen.getByRole('button', { name: '画像ファイルを開く' }),
      );

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('表示中: /image/folder')).toBeInTheDocument();
        expect(screen.getByText('開始位置: 2')).toBeInTheDocument();
      });
    });

    it('should not update state when open-image returns null', async () => {
      vi.mocked(mockOpenImageFile).mockResolvedValue(null);

      renderApp(mockFileSystemService);

      fireEvent.click(
        screen.getByRole('button', { name: '画像ファイルを開く' }),
      );

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      // 初期状態のまま変化しないことを確認
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();
    });

    it('should handle open-image with missing folderPath', async () => {
      vi.mocked(mockOpenImageFile).mockResolvedValue({
        index: 1,
      });

      renderApp(mockFileSystemService);

      fireEvent.click(
        screen.getByRole('button', { name: '画像ファイルを開く' }),
      );

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      // folderPathが欠落している場合は状態を更新しない
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should reset initial image index when opening folder', async () => {
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
        '/new/folder',
      );
      renderApp(mockFileSystemService);

      // まずサイドバーからフォルダを選択して初期状態を確立
      fireEvent.click(screen.getByRole('button', { name: 'folder1' }));

      // ダイアログ経由で新しいフォルダを開く
      fireEvent.click(screen.getByRole('button', { name: 'フォルダを開く' }));

      await waitFor(() => {
        // 新しいフォルダパスが表示され、開始位置テキストは表示されない（index=0のため）
        expect(screen.getByText('表示中: /new/folder')).toBeInTheDocument();
        expect(screen.queryByText(/開始位置:/)).not.toBeInTheDocument();
      });
    });

    it('should maintain folder path consistency between sidebar and image viewer', () => {
      renderApp();

      // サイドバーでフォルダを選択
      fireEvent.click(screen.getByRole('button', { name: 'folder2' }));

      // ImageViewerに選択されたフォルダパスが反映されていることを確認
      expect(screen.getByText('表示中: /test/folder2')).toBeInTheDocument();

      // サイドバー側でもクリックされたフォルダが選択状態になっていることを確認
      expect(screen.getByRole('button', { name: 'folder2' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    // フォルダパスが変化した際にImageViewerの表示内容が更新されることを検証
    it('should re-render ImageViewer with new key when folder path changes', () => {
      renderApp();

      // 初期状態では画像が選択されていない
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();

      // フォルダを切り替える
      fireEvent.click(screen.getByRole('button', { name: 'folder1' }));

      // フォルダが切り替わった後、対応するパスが表示されることを確認
      expect(
        screen.queryByText('画像が選択されていません'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('表示中: /test/folder1')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    // open-folder時にダイアログでエラーが発生してもアプリがクラッシュせず、状態が維持されることを検証
    it('should handle errors in folder dialog gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockRejectedValue(
        new Error('Dialog error'),
      );
      renderApp(mockFileSystemService);

      fireEvent.click(screen.getByRole('button', { name: 'フォルダを開く' }));

      await waitFor(() => {
        expect(mockFileSystemService.openDirectoryDialog).toHaveBeenCalled();
      });

      // 非同期エラーハンドリングが完了するのを待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      // クラッシュせず、初期状態が維持されることを確認
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    // open-image時にファイルオープンでエラーが発生してもアプリがクラッシュせず、状態が維持されることを検証
    it('should handle errors in image file opening gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(mockOpenImageFile).mockRejectedValue(
        new Error('Open image error'),
      );

      renderApp(mockFileSystemService);

      fireEvent.click(
        screen.getByRole('button', { name: '画像ファイルを開く' }),
      );

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      // 非同期エラーハンドリングが完了するのを待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      // クラッシュせず、初期状態が維持されることを確認
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });
});
